import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "이해민 의원실 과방위 의정 브리프",
    template: "%s · 이해민 의원실",
  },
  description:
    "이해민 의원실의 과방위 의정활동과 현안 브리프를 정리한 공식 정보 페이지입니다.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "이해민 의원실 과방위 의정 브리프",
    description:
      "이해민 의원실의 과방위 의정활동과 현안 브리프를 정리한 공식 정보 페이지입니다.",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1a2332",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          // Pretendard GOV 변수 폰트 (공공기관 합의체)
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-screen font-sans text-base leading-relaxed">
        <a
          href="#main"
          className="absolute left-2 top-2 z-50 -translate-y-20 rounded bg-primary px-3 py-2 text-primary-foreground focus:translate-y-0"
        >
          본문으로 건너뛰기
        </a>
        {children}
      </body>
    </html>
  );
}
