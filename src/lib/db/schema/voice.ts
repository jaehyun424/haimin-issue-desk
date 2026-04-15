import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, updatedAt, voiceStatusEnum, voiceTypeEnum } from "./_shared";
import { issueCategories } from "./categories";
import { issues } from "./issues";
import { users } from "./users";

/**
 * 정책 제안 / 현장 의견 접수.
 *
 * - 원칙: 익명/가명 기본. 이름·이메일은 선택 입력.
 * - 주민번호/휴대전화/주소/첨부파일 없음 (v1).
 * - 공개 금지: 담당자만 조회. 외부 발행은 "종합 의견" 형태로만.
 */
export const voiceSubmissions = pgTable(
  "voice_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: voiceTypeEnum("type").notNull(),
    categoryId: uuid("category_id").references(() => issueCategories.id, {
      onDelete: "set null",
    }),
    displayName: text("display_name"),
    email: text("email"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    /** 개인정보 수집·이용 동의. 필수. */
    consentRequired: boolean("consent_required").notNull().default(false),
    /** 연락처 보관·후속 연락 동의. 선택. */
    consentOptionalContact: boolean("consent_optional_contact").notNull().default(false),
    status: voiceStatusEnum("status").notNull().default("new"),
    assignedUserId: uuid("assigned_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    relatedIssueId: uuid("related_issue_id").references(() => issues.id, {
      onDelete: "set null",
    }),
    /** IP 원문은 저장하지 않음. 해시만 7일 보관 정책 대상. */
    ipHash: text("ip_hash"),
    /** turnstile 토큰 검증 결과 (성공/실패 이유 로깅용) */
    captchaVerdict: text("captcha_verdict"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    statusIdx: index("voice_submissions_status_idx").on(t.status),
    createdIdx: index("voice_submissions_created_idx").on(t.createdAt),
  }),
);

export const voiceSubmissionsRelations = relations(voiceSubmissions, ({ one }) => ({
  assignedUser: one(users, {
    fields: [voiceSubmissions.assignedUserId],
    references: [users.id],
  }),
  relatedIssue: one(issues, {
    fields: [voiceSubmissions.relatedIssueId],
    references: [issues.id],
  }),
  category: one(issueCategories, {
    fields: [voiceSubmissions.categoryId],
    references: [issueCategories.id],
  }),
}));

export type VoiceSubmission = typeof voiceSubmissions.$inferSelect;
export type NewVoiceSubmission = typeof voiceSubmissions.$inferInsert;
