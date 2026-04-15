import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "이해민 의원실 과방위 의정 브리프";

/**
 * OG 이미지 — 텍스트 3줄만, 장식 없음.
 * Pretendard-Bold 는 `src/app/Pretendard-Bold.otf` 에서 지연 로드 + 캐시.
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
    ? [
        {
          name: "Pretendard",
          data: font,
          weight: 700 as const,
          style: "normal" as const,
        },
      ]
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
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          padding: "0 96px",
          background: "#0F1E3D",
          color: "#ffffff",
          fontFamily,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 32,
            letterSpacing: 2,
            opacity: 0.7,
          }}
        >
          이해민 의원실
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 110,
            lineHeight: 1.1,
            letterSpacing: -2,
          }}
        >
          과방위 의정 브리프
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            opacity: 0.7,
          }}
        >
          공식 출처 기반 현안 브리프
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
