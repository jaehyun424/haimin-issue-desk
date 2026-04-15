import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "이해민 의원실 과방위 의정 브리프";

/**
 * Google Fonts 에서 Noto Sans KR 을 부를 때 "text" 파라미터로 서브셋만
 * 내려오도록 요청한다. 실패해도 렌더 자체는 유지되도록 폰트 유무를 방어.
 */
const OG_TEXT =
  "이해민 의원실 과방위 의정 브리프 과학기술정보방송통신위원회 현안을 사실 중심으로 공식 출처 기반 reviewer 승인 발행 브리프 의정활동 정책 제안";

async function fetchGoogleFont(
  family: string,
  weight: number,
  text: string,
): Promise<ArrayBuffer | null> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family,
  )}:wght@${weight}&text=${encodeURIComponent(text)}`;
  try {
    const css = await fetch(cssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },
    }).then((r) => r.text());
    const match = /src:\s*url\(([^)]+)\)/.exec(css);
    if (!match) return null;
    const fontUrl = match[1]!.replace(/["']/g, "");
    const res = await fetch(fontUrl);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const [bold, regular] = await Promise.all([
    fetchGoogleFont("Noto Sans KR", 700, OG_TEXT),
    fetchGoogleFont("Noto Sans KR", 400, OG_TEXT),
  ]);

  const fonts = [
    ...(bold
      ? [
          {
            name: "Noto Sans KR" as const,
            data: bold,
            weight: 700 as const,
            style: "normal" as const,
          },
        ]
      : []),
    ...(regular
      ? [
          {
            name: "Noto Sans KR" as const,
            data: regular,
            weight: 400 as const,
            style: "normal" as const,
          },
        ]
      : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 96px",
          background: "#0F1E3D",
          color: "#ffffff",
          fontFamily: "Noto Sans KR, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#132957",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <div style={{ width: 24, height: 3, borderRadius: 2, background: "#fff" }} />
            <div
              style={{
                width: 16,
                height: 3,
                borderRadius: 2,
                background: "rgba(255,255,255,0.75)",
              }}
            />
            <div
              style={{
                width: 20,
                height: 3,
                borderRadius: 2,
                background: "rgba(255,255,255,0.5)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 2,
              opacity: 0.75,
              fontWeight: 400,
            }}
          >
            이해민 의원실
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 100,
              lineHeight: 1.1,
              fontWeight: 700,
              letterSpacing: -2,
            }}
          >
            과방위 의정 브리프
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              lineHeight: 1.4,
              opacity: 0.75,
              fontWeight: 400,
            }}
          >
            과학기술정보방송통신위원회 현안을 사실 중심으로.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            opacity: 0.6,
            fontWeight: 400,
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            <span>브리프</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>의정활동</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>정책 제안</span>
          </div>
          <div>공식 출처 기반 · reviewer 승인 발행</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
