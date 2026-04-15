"use client";

import Script from "next/script";

/**
 * Cloudflare Turnstile 위젯.
 *
 * - siteKey 가 주입되지 않으면 아무것도 렌더하지 않는다.
 *   (폼은 서버쪽 검증이 `missing_token` 일 때도 통과하도록 구성돼 있으므로 안전)
 * - `cf-turnstile-response` 라는 hidden input 을 자동 생성하며, 이 이름은
 *   서버 액션이 기대하는 필드명과 일치한다.
 */
export function TurnstileWidget({ siteKey }: { siteKey?: string }) {
  if (!siteKey) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-theme="light"
        data-size="flexible"
        aria-label="자동화 방지 확인"
      />
    </>
  );
}
