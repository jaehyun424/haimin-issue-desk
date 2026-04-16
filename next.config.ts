import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // lint/typecheck 는 CI 에서 별도로 돌린다. 빌드 실패 방지.
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  experimental: {
    serverActions: {
      bodySizeLimit: "512kb",
    },
  },
  serverExternalPackages: ["postgres", "bcryptjs"],
  // OG 라우트에 Pretendard 번들 폰트를 명시적으로 포함시킨다.
  outputFileTracingIncludes: {
    "/opengraph-image": ["./src/app/Pretendard-Bold.otf"],
  },
  async headers() {
    // Content Security Policy.
    // - Turnstile(cloudflare), Pretendard GOV(jsdelivr) 외부 origin 만 예외 허용.
    // - `unsafe-inline` script 는 Next.js 가 렌더에 필요로 함(스트림 부트스트랩).
    //   `unsafe-inline` style 은 tailwind + shadcn 의 style 속성 주입 때문에 필요.
    // - 깨지는 경우: /voice Turnstile, OG 이미지, 폰트 로드 상태를 브라우저 콘솔로
    //   확인 후 필요 최소 도메인만 추가.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "font-src 'self' https://cdn.jsdelivr.net data:",
      "img-src 'self' data: https:",
      "frame-src https://challenges.cloudflare.com",
      "connect-src 'self' https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default config;
