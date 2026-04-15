import "server-only";

/**
 * Cloudflare Turnstile 서버 검증.
 *
 * 정책: 시크릿 미설정 = 구성 오류(fail-closed). 운영에서 voice_enabled=true 인데
 * TURNSTILE_SECRET_KEY 가 없으면 제출을 허용하지 않는다.
 */

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
}

export type TurnstileVerdict =
  | "ok"
  | "rejected"
  | "missing_token"
  | "not_configured"
  | "network_error";

export interface TurnstileResult {
  success: boolean;
  verdict: TurnstileVerdict;
  errors?: string[];
}

export async function verifyTurnstile(
  token: string | undefined,
  remoteIp?: string,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { success: false, verdict: "not_configured" };
  }
  if (!token) {
    return { success: false, verdict: "missing_token" };
  }
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const json = (await res.json()) as TurnstileResponse;
    return {
      success: json.success,
      verdict: json.success ? "ok" : "rejected",
      errors: json["error-codes"],
    };
  } catch (err) {
    console.error("[turnstile] 검증 실패", err);
    return { success: false, verdict: "network_error" };
  }
}
