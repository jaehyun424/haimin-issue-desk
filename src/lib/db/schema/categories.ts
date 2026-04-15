import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "./_shared";

export const issueCategories = pgTable("issue_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type IssueCategory = typeof issueCategories.$inferSelect;
export type NewIssueCategory = typeof issueCategories.$inferInsert;
