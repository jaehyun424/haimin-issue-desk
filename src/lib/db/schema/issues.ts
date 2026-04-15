import { relations } from "drizzle-orm";
import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, issuePriorityEnum, issueStatusEnum, updatedAt } from "./_shared";
import { issueCategories } from "./categories";
import { users } from "./users";

export const issues = pgTable(
  "issues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary"),
    status: issueStatusEnum("status").notNull().default("new"),
    priority: issuePriorityEnum("priority").notNull().default("medium"),
    primaryCategoryId: uuid("primary_category_id").references(() => issueCategories.id, {
      onDelete: "set null",
    }),
    ownerUserId: uuid("owner_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    statusIdx: index("issues_status_idx").on(t.status),
    categoryIdx: index("issues_category_idx").on(t.primaryCategoryId),
  }),
);

/**
 * 이슈 ↔ 카테고리 다대다. (한 이슈에 보조 카테고리 복수 허용)
 */
export const issueCategoryLinks = pgTable("issue_category_links", {
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => issueCategories.id, { onDelete: "cascade" }),
});

export const issuesRelations = relations(issues, ({ one, many }) => ({
  primaryCategory: one(issueCategories, {
    fields: [issues.primaryCategoryId],
    references: [issueCategories.id],
  }),
  owner: one(users, {
    fields: [issues.ownerUserId],
    references: [users.id],
  }),
  categoryLinks: many(issueCategoryLinks),
}));

export const issueCategoryLinksRelations = relations(issueCategoryLinks, ({ one }) => ({
  issue: one(issues, {
    fields: [issueCategoryLinks.issueId],
    references: [issues.id],
  }),
  category: one(issueCategories, {
    fields: [issueCategoryLinks.categoryId],
    references: [issueCategories.id],
  }),
}));

export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
