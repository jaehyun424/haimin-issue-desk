import { index, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt } from "./_shared";
import { users } from "./users";

/**
 * 관리자 주요 액션 감사 로그.
 *
 * 기록 원칙:
 * - 로그인/로그아웃, 이슈/소스/브리프 CRUD, 발행/아카이브, 플래그 변경, 카테고리 변경.
 * - 비밀번호·이메일 본문 등 민감 원문은 기록하지 않는다.
 * - 토큰/시크릿은 기록하지 않는다.
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id"),
    payloadJson: jsonb("payload_json"),
    createdAt: createdAt(),
  },
  (t) => ({
    actorIdx: index("audit_logs_actor_idx").on(t.actorUserId),
    actionIdx: index("audit_logs_action_idx").on(t.action),
    createdIdx: index("audit_logs_created_idx").on(t.createdAt),
  }),
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
