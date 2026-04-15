import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, sourceTypeEnum, updatedAt } from "./_shared";
import { issues } from "./issues";

export const sourceDocuments = pgTable(
  "source_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceType: sourceTypeEnum("source_type").notNull(),
    sourceName: text("source_name").notNull(),
    externalId: text("external_id"),
    url: text("url"),
    title: text("title").notNull(),
    bodyText: text("body_text"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
    /**
     * SHA-256(url + title + publishedAt) 기반 해시.
     * unique 제약까지는 걸지 않고 index + 앱 레이어 dedup 으로 관리한다.
     * (동일 기사 재크롤 시 hash 충돌을 upsert 로 처리)
     */
    hash: text("hash").notNull(),
    language: text("language").default("ko"),
    metadataJson: jsonb("metadata_json"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    hashIdx: index("source_documents_hash_idx").on(t.hash),
    typeIdx: index("source_documents_type_idx").on(t.sourceType),
    publishedIdx: index("source_documents_published_idx").on(t.publishedAt),
  }),
);

export const issueSourceLinks = pgTable(
  "issue_source_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    issueId: uuid("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    sourceDocumentId: uuid("source_document_id")
      .notNull()
      .references(() => sourceDocuments.id, { onDelete: "cascade" }),
    relevanceScore: integer("relevance_score").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => ({
    issueIdx: index("issue_source_links_issue_idx").on(t.issueId),
    sourceIdx: index("issue_source_links_source_idx").on(t.sourceDocumentId),
  }),
);

export const sourceDocumentsRelations = relations(sourceDocuments, ({ many }) => ({
  issueLinks: many(issueSourceLinks),
}));

export const issueSourceLinksRelations = relations(issueSourceLinks, ({ one }) => ({
  issue: one(issues, {
    fields: [issueSourceLinks.issueId],
    references: [issues.id],
  }),
  source: one(sourceDocuments, {
    fields: [issueSourceLinks.sourceDocumentId],
    references: [sourceDocuments.id],
  }),
}));

export type SourceDocument = typeof sourceDocuments.$inferSelect;
export type NewSourceDocument = typeof sourceDocuments.$inferInsert;
