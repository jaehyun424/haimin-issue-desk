import { describe, it, expect } from "vitest";
import { rateLimit } from "./index";

/**
 * 메모리 백엔드 기반. 테스트마다 새로운 key 를 써서 bucket 충돌 방지.
 */
describe("rateLimit (memory backend)", () => {
  it("limit 이하 요청은 ok=true 와 감소하는 remaining 을 반환", async () => {
    const key = `t-${Math.random()}`;
    const r1 = await rateLimit(key, { limit: 3, windowMs: 10_000 });
    const r2 = await rateLimit(key, { limit: 3, windowMs: 10_000 });
    const r3 = await rateLimit(key, { limit: 3, windowMs: 10_000 });
    expect(r1.ok).toBe(true);
    expect(r1.remaining).toBe(2);
    expect(r2.remaining).toBe(1);
    expect(r3.remaining).toBe(0);
  });

  it("limit 초과 시 ok=false 와 resetAt 반환", async () => {
    const key = `t-${Math.random()}`;
    await rateLimit(key, { limit: 2, windowMs: 10_000 });
    await rateLimit(key, { limit: 2, windowMs: 10_000 });
    const blocked = await rateLimit(key, { limit: 2, windowMs: 10_000 });
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetAt).toBeGreaterThan(Date.now());
  });

  it("window 가 지나면 bucket reset", async () => {
    const key = `t-${Math.random()}`;
    const r1 = await rateLimit(key, { limit: 1, windowMs: 1 }); // 1ms
    // 2ms 대기
    await new Promise((r) => setTimeout(r, 5));
    const r2 = await rateLimit(key, { limit: 1, windowMs: 1 });
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
  });
});
