import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "이해민 의원실 과방위 의정 브리프";

/**
 * OG 이미지 (1200x630). Pretendard-Bold 를 `src/app/Pretendard-Bold.otf` 에서
 * 읽는다. 모듈 스코프가 아니라 함수 안에서 지연 로드하고 한 번만 캐시하여
 * build 트레이스 단계에서 읽기 실패가 발생하지 않도록 한다.
 */
let CACHED_FONT: Buffer | null = null;

function loadFont(): Buffer | null {
  if (CACHED_FONT) return CACHED_FONT;
  try {
    const p = join(process.cwd(), "src/app/Pretendard-Bold.otf");
    CACHED_FONT = readFileSync(p);
    return CACHED_FONT;
  } catch {
    return null;
  }
}

export default function OpenGraphImage() {
  const font = loadFont();
  const fonts = font
    ? [{ name: "Pretendard", data: font, weight: 700 as const, style: "normal" as const }]
    : undefined;
  const fontFamily = font ? "Pretendard" : "system-ui, sans-serif";

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
          fontFamily,
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
              opacity: 0.8,
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
              opacity: 0.8,
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
            opacity: 0.65,
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            <span>브리프</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>의정활동</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>정책 제안</span>
          </div>
          <div>공식 출처 기반 · 검토자 승인 발행</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
