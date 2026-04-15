import "server-only";

/**
 * Cloudflare Turnstile 서버 검증.
 *
 * 시크릿이 설정돼 있지 않으면 v1 에서는 "검증 보류" 로 통과시키되 경고 로그.
 * (feature flag voice_enabled=OFF 상태에서 불필요한 503 을 내지 않기 위함)
 */

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
}

export async function verifyTurnstile(token: string | undefined, remoteIp?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { success: true, verdict: "no_secret_configured" as const };
  }
  if (!token) {
    return { success: false, verdict: "missing_token" as const };
  }
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const json = (await res.json()) as TurnstileResponse;
    return {
      success: json.success,
      verdict: json.success ? ("ok" as const) : ("rejected" as const),
      errors: json["error-codes"],
    };
  } catch (err) {
    console.error("[turnstile] 검증 실패", err);
    return { success: false, verdict: "network_error" as const };
  }
}
