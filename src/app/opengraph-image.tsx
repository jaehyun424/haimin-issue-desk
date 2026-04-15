import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "이해민 의원실 과방위 의정 브리프";

/**
 * 홈 기본 OG 이미지 (1200x630).
 * Next.js App Router 가 자동으로 메타데이터에 hook-in 한다.
 * 한국어 본문 렌더링을 위해 Pretendard 700 를 jsdelivr CDN에서 로드.
 */
export default async function OpenGraphImage() {
  const pretendard = await fetch(
    "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/woff/Pretendard-Bold.woff",
  ).then((r) => r.arrayBuffer());

  const pretendardRegular = await fetch(
    "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/woff/Pretendard-Regular.woff",
  ).then((r) => r.arrayBuffer());

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
          fontFamily: "Pretendard",
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
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: pretendard, weight: 700, style: "normal" },
        { name: "Pretendard", data: pretendardRegular, weight: 400, style: "normal" },
      ],
    },
  );
}
