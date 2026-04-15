import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { briefStatusEnum, createdAt, updatedAt } from "./_shared";
import { issues } from "./issues";
import { users } from "./users";

export const briefs = pgTable(
  "briefs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    issueId: uuid("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    bodyMd: text("body_md").notNull(),
    status: briefStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    reviewerUserId: uuid("reviewer_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    statusIdx: index("briefs_status_idx").on(t.status),
    publishedIdx: index("briefs_published_idx").on(t.publishedAt),
    issueIdx: index("briefs_issue_idx").on(t.issueId),
  }),
);

export const briefsRelations = relations(briefs, ({ one }) => ({
  issue: one(issues, {
    fields: [briefs.issueId],
    references: [issues.id],
  }),
  reviewer: one(users, {
    fields: [briefs.reviewerUserId],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [briefs.createdByUserId],
    references: [users.id],
  }),
}));

export type Brief = typeof briefs.$inferSelect;
export type NewBrief = typeof briefs.$inferInsert;
