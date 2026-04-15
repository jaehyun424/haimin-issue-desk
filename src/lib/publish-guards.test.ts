import { describe, it, expect } from "vitest";
import { checkPublishable } from "./publish-guards";

const base = {
  summaryLength: 50,
  bodyLength: 400,
  sourceCount: 1,
  electionModeOn: true,
  currentStatus: "review" as const,
};

describe("checkPublishable", () => {
  it("모두 충족하면 ok", () => {
    expect(checkPublishable(base)).toEqual({ ok: true });
  });

  it("요약/본문 짧으면 too_short", () => {
    expect(checkPublishable({ ...base, summaryLength: 5 }).ok).toBe(false);
    expect(checkPublishable({ ...base, summaryLength: 5 })).toMatchObject({ code: "too_short" });
    expect(checkPublishable({ ...base, bodyLength: 10 })).toMatchObject({ code: "too_short" });
  });

  it("출처 0건이면 no_source", () => {
    expect(checkPublishable({ ...base, sourceCount: 0 })).toMatchObject({ code: "no_source" });
  });

  it("선거모드 ON + draft 면 must_review_first (review 경유 강제)", () => {
    expect(
      checkPublishable({ ...base, currentStatus: "draft" }),
    ).toMatchObject({ code: "must_review_first" });
  });

  it("선거모드 OFF 면 draft 에서도 (length + source 만족 시) 통과", () => {
    expect(
      checkPublishable({ ...base, electionModeOn: false, currentStatus: "draft" }),
    ).toEqual({ ok: true });
  });
});
