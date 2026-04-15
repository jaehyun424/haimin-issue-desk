import "server-only";

/**
 * Rate limit 추상화.
 *
 * v1 은 인메모리 기본 구현만 제공 (단일 인스턴스·프로세스 재시작 시 리셋).
 * 운영에서는 Upstash/KV 로 교체. `RATE_LIMIT_BACKEND` 로 분기한다.
 */

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

interface Bucket {
  count: number;
  windowStart: number;
}

const store = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** 허용 요청 수 */
  limit: number;
  /** 윈도우 (밀리초) */
  windowMs: number;
}

export async function rateLimit(
  key: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const backend = process.env.RATE_LIMIT_BACKEND ?? "memory";
  if (backend !== "memory") {
    // TODO: Upstash/KV 연결. v1 은 의도적으로 미구현.
    console.warn(`[rate-limit] backend=${backend} 미구현. 메모리 fallback.`);
  }

  const now = Date.now();
  const bucket = store.get(key);
  if (!bucket || now - bucket.windowStart >= opts.windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { ok: true, remaining: opts.limit - 1, resetAt: now + opts.windowMs };
  }
  if (bucket.count >= opts.limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: bucket.windowStart + opts.windowMs,
    };
  }
  bucket.count += 1;
  return {
    ok: true,
    remaining: opts.limit - bucket.count,
    resetAt: bucket.windowStart + opts.windowMs,
  };
}

/**
 * IP 해시. 원본 IP 는 저장·로그 금지 — hash 만 bucket 키/감사에 사용.
 * node:crypto 는 server-only 경로에서만 import.
 */
export async function hashIp(ip: string, salt = "haimin"): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 24);
}
