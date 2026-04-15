import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstile } from "./turnstile";

const originalSecret = process.env.TURNSTILE_SECRET_KEY;

describe("verifyTurnstile (fail-closed)", () => {
  beforeEach(() => {
    delete process.env.TURNSTILE_SECRET_KEY;
  });
  afterEach(() => {
    process.env.TURNSTILE_SECRET_KEY = originalSecret;
    vi.restoreAllMocks();
  });

  it("시크릿 없으면 success=false, verdict=not_configured (fail-closed)", async () => {
    const r = await verifyTurnstile("some-token");
    expect(r.success).toBe(false);
    expect(r.verdict).toBe("not_configured");
  });

  it("시크릿 있는데 토큰 없으면 success=false", async () => {
    process.env.TURNSTILE_SECRET_KEY = "sec";
    const r = await verifyTurnstile(undefined);
    expect(r.success).toBe(false);
    expect(r.verdict).toBe("missing_token");
  });

  it("Cloudflare success=false 면 rejected 로 반환", async () => {
    process.env.TURNSTILE_SECRET_KEY = "sec";
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ success: false, "error-codes": ["bad"] }),
            { status: 200 },
          ),
      ),
    );
    const r = await verifyTurnstile("bad-token");
    expect(r.success).toBe(false);
    expect(r.verdict).toBe("rejected");
  });
});
