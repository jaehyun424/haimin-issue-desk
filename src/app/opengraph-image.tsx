import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Haimin Office brief";

// 최소 재현 버전 — Korean 문자 + font 로딩을 제거해 ImageResponse 자체 동작 검증.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0F1E3D",
          color: "#fff",
          fontSize: 72,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div>Haimin Office</div>
        <div style={{ fontSize: 40, opacity: 0.7, marginTop: 24 }}>
          Korea National Assembly Brief
        </div>
      </div>
    ),
    { ...size },
  );
}
