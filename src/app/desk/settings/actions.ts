"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { issueCategories } from "@/lib/db/schema";
import { requireCapability } from "@/lib/auth/session";
import { writeAudit } from "@/lib/audit";
import { setFlag } from "@/lib/feature-flags";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "@/lib/validation/category";
import { uuid } from "@/lib/validation/common";
import { FLAG, type FlagKey } from "@/lib/constants/feature-flags";

const flagSchema = z.object({
  key: z.enum([FLAG.AI_ENABLED, FLAG.ELECTION_MODE, FLAG.VOICE_ENABLED] as [
    FlagKey,
    FlagKey,
    FlagKey,
  ]),
  enabled: z.boolean(),
});

export async function toggleFlagAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("flag.manage");
  const parsed = flagSchema.safeParse({
    key: fd.get("key")?.toString(),
    enabled: fd.get("enabled") === "true",
  });
  if (!parsed.success) return { ok: false, error: "잘못된 플래그" } as const;

  await setFlag(parsed.data.key, parsed.data.enabled);
  await writeAudit({
    actorUserId: session.user.id,
    action: "flag.update",
    targetType: "flag",
    targetId: parsed.data.key,
    payload: { enabled: parsed.data.enabled },
  });
  revalidatePath("/desk/settings");
  revalidatePath("/");
  revalidatePath("/voice");
  return { ok: true } as const;
}

export async function createCategoryAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("category.manage");
  const parsed = categoryCreateSchema.safeParse({
    name: fd.get("name")?.toString(),
    sortOrder: fd.get("sortOrder")?.toString() ?? "0",
    isActive: fd.get("isActive") !== "false",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "오류" } as const;

  await db.insert(issueCategories).values(parsed.data).onConflictDoNothing();
  await writeAudit({
    actorUserId: session.user.id,
    action: "category.create",
    targetType: "category",
    targetId: parsed.data.name,
    payload: { sortOrder: parsed.data.sortOrder },
  });
  revalidatePath("/desk/settings");
  return { ok: true } as const;
}

export async function updateCategoryAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("category.manage");
  const parsed = categoryUpdateSchema.safeParse({
    id: fd.get("id")?.toString(),
    name: fd.get("name")?.toString(),
    sortOrder: fd.get("sortOrder")?.toString() ?? "0",
    isActive: fd.get("isActive") !== "false",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "오류" } as const;
  const { id, ...rest } = parsed.data;
  await db
    .update(issueCategories)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(issueCategories.id, id));
  await writeAudit({
    actorUserId: session.user.id,
    action: "category.update",
    targetType: "category",
    targetId: id,
    payload: { changedFields: Object.keys(rest) },
  });
  revalidatePath("/desk/settings");
  return { ok: true } as const;
}

const deleteSchema = z.object({ id: uuid });
export async function deleteCategoryAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("category.manage");
  const parsed = deleteSchema.safeParse({ id: fd.get("id")?.toString() });
  if (!parsed.success) return { ok: false, error: "잘못된 id" } as const;
  await db.delete(issueCategories).where(eq(issueCategories.id, parsed.data.id));
  await writeAudit({
    actorUserId: session.user.id,
    action: "category.delete",
    targetType: "category",
    targetId: parsed.data.id,
  });
  revalidatePath("/desk/settings");
  return { ok: true } as const;
}
