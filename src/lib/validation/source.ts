import { z } from "zod";
import { requiredString, trimmedString, uuid } from "./common";

export const SOURCE_TYPES = ["assembly_api", "news_api", "rss", "manual"] as const;

export const SOURCE_TYPE_LABELS: Record<(typeof SOURCE_TYPES)[number], string> = {
  assembly_api: "국회 API",
  news_api: "뉴스 API",
  rss: "RSS",
  manual: "편집 등록",
};

export const sourceCreateSchema = z.object({
  sourceType: z.enum(SOURCE_TYPES).default("manual"),
  sourceName: requiredString(1, 100, "출처 기관/매체"),
  title: requiredString(2, 300, "제목"),
  url: z.string().trim().url("올바른 URL 이어야 합니다.").optional().or(z.literal("")),
  bodyText: trimmedString(20_000).optional(),
  externalId: trimmedString(120).optional(),
  publishedAt: z.union([z.string(), z.date()]).optional(),
});

export const sourceLinkSchema = z.object({
  issueId: uuid,
  sourceDocumentId: uuid,
  isPrimary: z.boolean().default(false),
});

export type SourceCreateInput = z.infer<typeof sourceCreateSchema>;
export type SourceLinkInput = z.infer<typeof sourceLinkSchema>;
