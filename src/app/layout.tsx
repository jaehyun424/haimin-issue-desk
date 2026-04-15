import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_NAME = "이해민 의원실 과방위 의정 브리프";
const SITE_DESC =
  "이해민 의원실이 과학기술정보방송통신위원회 관련 의정활동과 현안 브리프를 공식 출처 기반으로 정리한 공개 페이지입니다.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: SITE_NAME,
    template: "%s · 이해민 의원실",
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESC,
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#132957",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          // Pretendard GOV 변수 폰트 (공공기관 합의체)
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-screen font-sans text-base leading-relaxed">
        <a
          href="#main"
          className="absolute left-2 top-2 z-[60] -translate-y-20 rounded bg-primary px-3 py-2 text-primary-foreground focus:translate-y-0"
        >
          본문으로 건너뛰기
        </a>
        {children}
      </body>
    </html>
  );
}
