import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

export default NextAuth(authConfig).auth;

export const config = {
  // /desk 하위만 가드. 정적 asset/이미지/API 는 미들웨어에서 제외.
  matcher: ["/desk/:path*"],
};
