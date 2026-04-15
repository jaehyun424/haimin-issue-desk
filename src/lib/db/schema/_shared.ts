import { sql } from "drizzle-orm";
import { pgEnum, timestamp } from "drizzle-orm/pg-core";

/**
 * 공용 enum 및 타임스탬프 helper.
 * Drizzle enum 은 migration 상 "생성되는 PG type" 이므로 파일 하나에 모아둔다.
 */

export const roleEnum = pgEnum("role", [
  "admin",
  "editor",
  "reviewer",
  "viewer",
]);

export const issueStatusEnum = pgEnum("issue_status", [
  "new",
  "reviewing",
  "tracked",
  "ready_to_publish",
  "published",
  "archived",
]);

export const issuePriorityEnum = pgEnum("issue_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const briefStatusEnum = pgEnum("brief_status", [
  "draft",
  "review",
  "published",
  "archived",
]);

export const sourceTypeEnum = pgEnum("source_type", [
  "assembly_api",
  "news_api",
  "rss",
  "manual",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "bill",
  "vote",
  "schedule",
  "speech",
  "office_action",
  "press",
]);

export const voiceTypeEnum = pgEnum("voice_type", [
  "policy_proposal",
  "field_report",
  "personal_grievance",
  "partnership",
]);

export const voiceStatusEnum = pgEnum("voice_status", [
  "new",
  "screened",
  "closed",
]);

export const createdAt = () =>
  timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`);

export const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`);
