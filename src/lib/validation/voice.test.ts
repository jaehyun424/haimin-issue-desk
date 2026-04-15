import { describe, it, expect } from "vitest";
import { voiceSubmitSchema } from "./voice";

const valid = {
  type: "policy_proposal" as const,
  title: "AI 기본법 하위법령 의견",
  body: "고영향 AI 영향평가 공개 범위에 대한 제안입니다. 업계·시민사회 의견을 균형 있게 반영해야 합니다.",
  consentRequired: true,
  consentOptionalContact: false,
};

describe("voiceSubmitSchema", () => {
  it("필수 동의 없으면 거부", () => {
    const r = voiceSubmitSchema.safeParse({ ...valid, consentRequired: false });
    expect(r.success).toBe(false);
  });

  it("본문이 20자 미만이면 거부", () => {
    const r = voiceSubmitSchema.safeParse({ ...valid, body: "짧음" });
    expect(r.success).toBe(false);
  });

  it("후속 연락 동의 시 이메일 누락은 거부", () => {
    const r = voiceSubmitSchema.safeParse({
      ...valid,
      consentOptionalContact: true,
      email: "",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const msg = r.error.issues.map((i) => i.message).join(" ");
      expect(msg).toContain("이메일");
    }
  });

  it("정상 입력은 통과", () => {
    const r = voiceSubmitSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });
});
