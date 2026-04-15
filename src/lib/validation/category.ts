import { z } from "zod";
import { requiredString, uuid } from "./common";

export const categoryCreateSchema = z.object({
  name: requiredString(2, 60, "카테고리명"),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
  isActive: z.boolean().default(true),
});

export const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  id: uuid,
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
