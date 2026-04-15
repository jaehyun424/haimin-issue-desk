import type { NextAuthConfig } from "next-auth";
import type { Role } from "../constants/roles";

/**
 * Edge 런타임에서도 import 가능한 "뼈대" 설정.
 * - 미들웨어가 이 파일만 import 해야 Edge 에서 DB 번들 에러가 나지 않는다.
 * - Credentials 프로바이더와 DB 접근은 `./index.ts` 에서 덮어쓴다.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: {
    signIn: "/desk/login",
    error: "/desk/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id;
        token.role = (user as { role?: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const isDesk = pathname.startsWith("/desk");
      const isLogin = pathname === "/desk/login";
      if (!isDesk) return true;
      if (isLogin) return true;
      return !!auth?.user;
    },
  },
};
