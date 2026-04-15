import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { users } from "../db/schema";
import { verifyPassword } from "./password";
import { authConfig } from "./config";

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

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
      authorize: async (raw) => {
        const parsed = credsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const found = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1);
        const user = found[0];
        if (!user || !user.isActive) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        // 마지막 로그인 시각 갱신 (로그인 실패 시에는 업데이트하지 않음).
        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, user.id));

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
