import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "이해민 의원실 과방위 의정 브리프";

/**
 * 홈 OG 이미지.
 *
 * Satori 가 한글 글리프를 기본 제공하지 않기 때문에, Google Fonts 의 css2 API 로
 * Noto Sans KR 의 "text subset" 을 요청해 실제 WOFF/WOFF2 를 받는다. 실패하면
 * 최소 ASCII 라인만 렌더되도록 방어. 이미지 자체는 항상 200 이어야 한다.
 */

const OG_TEXT =
  "이해민 의원실 과방위 의정 브리프 과학기술정보방송통신위원회 현안을 사실 중심으로 공식 출처 기반 reviewer 승인 발행 브리프 의정활동 정책 제안";

async function loadNotoSansKr(weight: 400 | 700): Promise<ArrayBuffer | null> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}&text=${encodeURIComponent(
    OG_TEXT,
  )}`;
  try {
    const css = await fetch(cssUrl, {
      headers: {
        // Google Fonts 는 UA 를 보고 woff2/ttf 를 분기하므로 최신 Chrome 값을 보낸다.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
      },
      cache: "force-cache",
    }).then((r) => (r.ok ? r.text() : ""));
    const match = /src:\s*url\(([^)]+)\)\s*format\(['"]woff2?['"]\)/i.exec(css);
    if (!match) return null;
    const fontUrl = match[1]!.replace(/^["']|["']$/g, "");
    const fontRes = await fetch(fontUrl, { cache: "force-cache" });
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const [bold, regular] = await Promise.all([
    loadNotoSansKr(700),
    loadNotoSansKr(400),
  ]);

  const fonts: Array<{
    name: string;
    data: ArrayBuffer;
    weight: 400 | 700;
    style: "normal";
  }> = [];
  if (bold) fonts.push({ name: "Noto", data: bold, weight: 700, style: "normal" });
  if (regular) fonts.push({ name: "Noto", data: regular, weight: 400, style: "normal" });

  const fontFamily = fonts.length > 0 ? "Noto, system-ui, sans-serif" : "system-ui, sans-serif";

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
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}
