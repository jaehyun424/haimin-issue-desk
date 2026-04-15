import { z } from "zod";
import { optionalUuid, requiredString, trimmedString } from "./common";

export const VOICE_TYPES = [
  "policy_proposal",
  "field_report",
  "personal_grievance",
  "partnership",
] as const;

export const VOICE_TYPE_LABELS: Record<(typeof VOICE_TYPES)[number], string> = {
  policy_proposal: "정책 제안",
  field_report: "산업·현장 의견",
  personal_grievance: "개인 민원",
  partnership: "협업/인터뷰/자료 전달",
};

export const VOICE_TYPE_DESCRIPTIONS: Record<(typeof VOICE_TYPES)[number], string> = {
  policy_proposal: "과방위 소관 정책·법안에 대한 구체적 의견이나 제안",
  field_report: "산업·연구·교육 현장에서 겪은 제도·운영 이슈",
  personal_grievance: "개인 피해/민원 — 아래 별도 안내 참조",
  partnership: "언론·기관·단체의 연락 및 자료 전달",
};

export const VOICE_STATUSES = ["new", "screened", "closed"] as const;

export const VOICE_STATUS_LABELS: Record<(typeof VOICE_STATUSES)[number], string> = {
  new: "미분류",
  screened: "검토됨",
  closed: "종결",
};

export const voiceSubmitSchema = z
  .object({
    type: z.enum(VOICE_TYPES),
    categoryId: optionalUuid,
    displayName: trimmedString(40).optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("올바른 이메일이어야 합니다.")
      .optional()
      .or(z.literal("")),
    title: requiredString(4, 120, "제목"),
    body: requiredString(20, 3000, "내용"),
    consentRequired: z.literal(true, {
      errorMap: () => ({ message: "개인정보 수집·이용 동의가 필요합니다." }),
    }),
    consentOptionalContact: z.boolean().default(false),
    turnstileToken: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.consentOptionalContact && !data.email) {
      ctx.addIssue({
        path: ["email"],
        code: z.ZodIssueCode.custom,
        message: "후속 연락에 동의하셨다면 이메일을 입력해 주세요.",
      });
    }
  });

export type VoiceSubmitInput = z.infer<typeof voiceSubmitSchema>;
