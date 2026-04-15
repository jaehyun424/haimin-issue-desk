import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "이해민 의원실 과방위 의정 브리프";

/**
 * 홈 기본 OG 이미지 (1200x630).
 * Satori 는 한글 폰트가 bundled 되어 있지 않으므로 Pretendard 를 fetch 해서
 * 주입. 두 가중치를 병렬로 받고, 실패해도 페이지 렌더는 유지되도록 방어.
 */
async function fetchFont(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const [bold, regular] = await Promise.all([
    fetchFont(
      "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/woff/Pretendard-Bold.woff",
    ),
    fetchFont(
      "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/woff/Pretendard-Regular.woff",
    ),
  ]);

  const fonts = [
    ...(bold
      ? [{ name: "Pretendard" as const, data: bold, weight: 700 as const, style: "normal" as const }]
      : []),
    ...(regular
      ? [
          {
            name: "Pretendard" as const,
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
          fontFamily: "Pretendard, system-ui, sans-serif",
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
