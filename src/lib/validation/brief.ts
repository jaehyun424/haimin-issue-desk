import { z } from "zod";
import { requiredString, uuid } from "./common";

export const BRIEF_STATUSES = ["draft", "review", "published", "archived"] as const;

export const BRIEF_STATUS_LABELS: Record<(typeof BRIEF_STATUSES)[number], string> = {
  draft: "초안",
  review: "검토",
  published: "발행됨",
  archived: "보관",
};

export const briefCreateSchema = z.object({
  issueId: uuid,
  title: requiredString(2, 200, "제목"),
  summary: requiredString(10, 600, "요약"),
  bodyMd: requiredString(20, 30_000, "본문"),
});

export const briefUpdateSchema = briefCreateSchema.partial().extend({
  id: uuid,
});

export type BriefCreateInput = z.infer<typeof briefCreateSchema>;
export type BriefUpdateInput = z.infer<typeof briefUpdateSchema>;
