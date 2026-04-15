import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const alt = "이해민 의원실 과방위 의정 브리프";

/**
 * iOS 홈스크린 아이콘. 네이비 배경 + 흰색 이중줄 막대 (문서 모티프).
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#132957",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: 104,
          }}
        >
          <div style={{ height: 12, width: "100%", borderRadius: 6, background: "#ffffff" }} />
          <div
            style={{
              height: 12,
              width: "75%",
              borderRadius: 6,
              background: "rgba(255,255,255,0.75)",
            }}
          />
          <div
            style={{
              height: 12,
              width: "88%",
              borderRadius: 6,
              background: "rgba(255,255,255,0.5)",
            }}
          />
          <div
            style={{
              height: 12,
              width: "44%",
              borderRadius: 6,
              background: "rgba(255,255,255,0.35)",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
