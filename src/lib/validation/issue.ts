import { z } from "zod";
import { optionalUuid, requiredString, trimmedString, uuid } from "./common";

export const ISSUE_STATUSES = [
  "new",
  "reviewing",
  "tracked",
  "ready_to_publish",
  "published",
  "archived",
] as const;
export const ISSUE_PRIORITIES = ["low", "medium", "high", "critical"] as const;

export const ISSUE_STATUS_LABELS: Record<(typeof ISSUE_STATUSES)[number], string> = {
  new: "신규",
  reviewing: "검토중",
  tracked: "추적중",
  ready_to_publish: "발행 대기",
  published: "발행됨",
  archived: "보관",
};

export const ISSUE_PRIORITY_LABELS: Record<(typeof ISSUE_PRIORITIES)[number], string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
  critical: "긴급",
};

export const issueCreateSchema = z.object({
  title: requiredString(2, 200, "제목"),
  summary: trimmedString(2000).optional(),
  status: z.enum(ISSUE_STATUSES).default("new"),
  priority: z.enum(ISSUE_PRIORITIES).default("medium"),
  primaryCategoryId: optionalUuid,
  ownerUserId: optionalUuid,
  categoryIds: z.array(uuid).default([]),
});

export const issueUpdateSchema = issueCreateSchema.partial().extend({
  id: uuid,
});

export type IssueCreateInput = z.infer<typeof issueCreateSchema>;
export type IssueUpdateInput = z.infer<typeof issueUpdateSchema>;
