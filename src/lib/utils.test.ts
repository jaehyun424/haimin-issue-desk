import { describe, it, expect } from "vitest";
import { formatKoreanDate, koreanSlug, relativeFromNow, truncate } from "./utils";

describe("formatKoreanDate", () => {
  it("null/undefined 는 '-'", () => {
    expect(formatKoreanDate(null)).toBe("-");
    expect(formatKoreanDate(undefined)).toBe("-");
  });
  it("Date 인스턴스 포맷", () => {
    expect(formatKoreanDate(new Date("2026-04-15T00:00:00Z"))).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
  });
});

describe("koreanSlug", () => {
  it("영문 + 공백 → 하이픈 연결", () => {
    expect(koreanSlug("Hello World 2026")).toBe("hello-world-2026");
  });
  it("한글은 유지하고 특수문자 제거", () => {
    expect(koreanSlug("AI 기본법 / 시행령 (안)")).toBe("ai-기본법-시행령-안");
  });
  it("80자 이내로 자름", () => {
    const input = "a".repeat(200);
    expect(koreanSlug(input).length).toBeLessThanOrEqual(80);
  });
  it("앞뒤 하이픈 제거", () => {
    expect(koreanSlug("  -test-  ")).toBe("test");
  });
});

describe("truncate", () => {
  it("짧은 문자열은 그대로", () => {
    expect(truncate("abc", 10)).toBe("abc");
  });
  it("초과 시 말줄임표", () => {
    const out = truncate("abcdefghij", 5);
    expect(out.length).toBe(5);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("relativeFromNow", () => {
  it("'방금' / 분 단위 / 시간 단위 분기", () => {
    const now = Date.now();
    expect(relativeFromNow(new Date(now - 10_000))).toBe("방금");
    expect(relativeFromNow(new Date(now - 5 * 60_000))).toBe("5분 전");
    expect(relativeFromNow(new Date(now - 3 * 3600_000))).toBe("3시간 전");
  });
});
