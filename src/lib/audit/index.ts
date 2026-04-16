import "server-only";
import { db } from "../db";
import { auditLogs } from "../db/schema";

export type AuditAction =
  | "auth.login"
  | "auth.login_failure"
  | "auth.logout"
  | "issue.create"
  | "issue.update"
  | "issue.delete"
  | "source.create"
  | "source.update"
  | "source.delete"
  | "source.link"
  | "brief.create"
  | "brief.update"
  | "brief.submit_review"
  | "brief.publish"
  | "brief.archive"
  | "category.create"
  | "category.update"
  | "category.delete"
  | "flag.update"
  | "voice.assign"
  | "voice.update_status"
  | "user.create"
  | "user.update"
  | "user.deactivate";

export type AuditTarget =
  | "user"
  | "issue"
  | "source_document"
  | "brief"
  | "category"
  | "flag"
  | "voice_submission";

interface AuditArgs {
  actorUserId?: string | null;
  action: AuditAction;
  targetType: AuditTarget;
  targetId?: string | null;
  payload?: Record<string, unknown>;
}

/**
 * 비밀번호·토큰·민감 본문은 절대 전달하지 말 것.
 * payload 에는 어떤 필드가 바뀌었는지 정도만 요약해서 기록한다.
 */
export async function writeAudit(args: AuditArgs): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      actorUserId: args.actorUserId ?? null,
      action: args.action,
      targetType: args.targetType,
      targetId: args.targetId ?? null,
      payloadJson: args.payload ?? null,
    });
  } catch (err) {
    // audit 실패는 주 흐름을 깨뜨리지 않는다. 로깅만.
    console.error("[audit] 기록 실패", { action: args.action, err });
  }
}
