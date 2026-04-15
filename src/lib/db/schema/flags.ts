import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "./_shared";

export const featureFlags = pgTable("feature_flags", {
  key: text("key").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  description: text("description"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type NewFeatureFlag = typeof featureFlags.$inferInsert;
