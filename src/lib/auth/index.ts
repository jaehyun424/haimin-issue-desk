import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { users } from "../db/schema";
import { writeAudit } from "../audit";
import { hashIp, rateLimit } from "../rate-limit";
import { verifyPassword } from "./password";
import { authConfig } from "./config";

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** IP당 5분에 10회 로그인 시도 제한. */
const LOGIN_RATE_LIMIT = { limit: 10, windowMs: 5 * 60 * 1000 };

function extractIp(headers: Headers | undefined): string {
  if (!headers) return "unknown";
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

function extractUserAgent(headers: Headers | undefined): string {
  return (headers?.get("user-agent") ?? "").slice(0, 200);
}

/**
 * Node.js 런타임용 전체 Auth 설정.
 * - Credentials 프로바이더는 DB 접근이 필요하므로 Edge config 에서 분리.
 * - /api/auth/[...nextauth], 서버 컴포넌트, 서버 액션에서 사용.
 */
export const {
  auth,
  handlers,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      authorize: async (raw, request) => {
        const parsed = credsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase();

        // request.headers 는 v5 Credentials 에서 Request 객체로 들어옴.
        const headers = (request as unknown as { headers?: Headers } | undefined)?.headers;
        const ipHash = await hashIp(extractIp(headers), "login");
        const userAgent = extractUserAgent(headers);

        const rl = await rateLimit(`login:${ipHash}`, LOGIN_RATE_LIMIT);
        if (!rl.ok) {
          await writeAudit({
            actorUserId: null,
            action: "auth.login_failure",
            targetType: "user",
            targetId: null,
            payload: { email: normalizedEmail, ipHash, userAgent, reason: "rate_limited" },
          });
          return null;
        }

        const found = await db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);
        const user = found[0];
        if (!user || !user.isActive) {
          await writeAudit({
            actorUserId: user?.id ?? null,
            action: "auth.login_failure",
            targetType: "user",
            targetId: user?.id ?? null,
            payload: {
              email: normalizedEmail,
              ipHash,
              userAgent,
              reason: user ? "inactive" : "unknown_email",
            },
          });
          return null;
        }

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) {
          await writeAudit({
            actorUserId: user.id,
            action: "auth.login_failure",
            targetType: "user",
            targetId: user.id,
            payload: {
              email: normalizedEmail,
              ipHash,
              userAgent,
              reason: "wrong_password",
            },
          });
          return null;
        }

        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, user.id));

        await writeAudit({
          actorUserId: user.id,
          action: "auth.login",
          targetType: "user",
          targetId: user.id,
          payload: { email: normalizedEmail, ipHash, userAgent },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
