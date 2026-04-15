import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { activityTypeEnum, createdAt, updatedAt } from "./_shared";
import { issues } from "./issues";

/**
 * 의정 활동 통합 타임라인.
 *
 * - 공식/자동 데이터: 발의안/표결/일정/발언(bill, vote, schedule, speech)
 * - 수동 입력: 의원실 보도자료·후속조치(office_action, press)
 *
 * `metadataJson` 에는 원본 API 필드(의안번호, 회차 등)를 그대로 보관한다.
 */
export const memberActivities = pgTable(
  "member_activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    activityType: activityTypeEnum("activity_type").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    officialSourceUrl: text("official_source_url"),
    relatedIssueId: uuid("related_issue_id").references(() => issues.id, {
      onDelete: "set null",
    }),
    metadataJson: jsonb("metadata_json"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    occurredIdx: index("member_activities_occurred_idx").on(t.occurredAt),
    typeIdx: index("member_activities_type_idx").on(t.activityType),
  }),
);

export const memberActivitiesRelations = relations(memberActivities, ({ one }) => ({
  relatedIssue: one(issues, {
    fields: [memberActivities.relatedIssueId],
    references: [issues.id],
  }),
}));

export type MemberActivity = typeof memberActivities.$inferSelect;
export type NewMemberActivity = typeof memberActivities.$inferInsert;
