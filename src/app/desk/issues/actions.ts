"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { issueCategoryLinks, issues } from "@/lib/db/schema";
import { requireCapability } from "@/lib/auth/session";
import { writeAudit } from "@/lib/audit";
import { koreanSlug } from "@/lib/utils";
import {
  issueCreateSchema,
  issueUpdateSchema,
  ISSUE_STATUSES,
  ISSUE_PRIORITIES,
} from "@/lib/validation/issue";
import { uuid } from "@/lib/validation/common";

async function generateSlug(title: string): Promise<string> {
  const base = koreanSlug(title) || "issue";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${Date.now().toString(36).slice(-4)}`;
    const found = await db
      .select({ id: issues.id })
      .from(issues)
      .where(eq(issues.slug, candidate))
      .limit(1);
    if (found.length === 0) return candidate;
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

function parseFormData(fd: FormData) {
  const categoryIds = fd.getAll("categoryIds").filter(Boolean) as string[];
  return {
    title: fd.get("title")?.toString() ?? "",
    summary: fd.get("summary")?.toString() ?? "",
    status: fd.get("status")?.toString() ?? "new",
    priority: fd.get("priority")?.toString() ?? "medium",
    primaryCategoryId: fd.get("primaryCategoryId")?.toString() || undefined,
    ownerUserId: fd.get("ownerUserId")?.toString() || undefined,
    categoryIds,
  };
}

export async function createIssueAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("issue.write");
  const parsed = issueCreateSchema.safeParse(parseFormData(fd));
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.",
    } as const;
  }
  const slug = await generateSlug(parsed.data.title);
  const [created] = await db
    .insert(issues)
    .values({
      slug,
      title: parsed.data.title,
      summary: parsed.data.summary || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      primaryCategoryId: parsed.data.primaryCategoryId ?? null,
      ownerUserId: parsed.data.ownerUserId ?? session.user.id,
    })
    .returning({ id: issues.id });

  if (created && parsed.data.categoryIds.length > 0) {
    await db
      .insert(issueCategoryLinks)
      .values(parsed.data.categoryIds.map((cid) => ({ issueId: created.id, categoryId: cid })));
  }

  await writeAudit({
    actorUserId: session.user.id,
    action: "issue.create",
    targetType: "issue",
    targetId: created?.id ?? null,
    payload: { status: parsed.data.status, priority: parsed.data.priority },
  });

  revalidatePath("/desk/issues");
  revalidatePath("/desk");
  redirect(`/desk/issues/${created?.id ?? ""}`);
}

export async function updateIssueAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("issue.write");
  const id = fd.get("id")?.toString() ?? "";
  const parsed = issueUpdateSchema.safeParse({ id, ...parseFormData(fd) });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.",
    } as const;
  }
  const { id: issueId, categoryIds, ...rest } = parsed.data;

  await db
    .update(issues)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(issues.id, issueId));

  if (categoryIds) {
    await db.delete(issueCategoryLinks).where(eq(issueCategoryLinks.issueId, issueId));
    if (categoryIds.length > 0) {
      await db
        .insert(issueCategoryLinks)
        .values(categoryIds.map((cid) => ({ issueId, categoryId: cid })));
    }
  }

  await writeAudit({
    actorUserId: session.user.id,
    action: "issue.update",
    targetType: "issue",
    targetId: issueId,
    payload: { changedFields: Object.keys(rest) },
  });

  revalidatePath(`/desk/issues/${issueId}`);
  revalidatePath("/desk/issues");
  return { ok: true } as const;
}

const statusTransitionSchema = z.object({
  id: uuid,
  status: z.enum(ISSUE_STATUSES),
});

export async function changeIssueStatusAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("issue.write");
  const parsed = statusTransitionSchema.safeParse({
    id: fd.get("id")?.toString(),
    status: fd.get("status")?.toString(),
  });
  if (!parsed.success) return { ok: false, error: "잘못된 상태 값입니다." } as const;

  await db
    .update(issues)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(issues.id, parsed.data.id));

  await writeAudit({
    actorUserId: session.user.id,
    action: "issue.update",
    targetType: "issue",
    targetId: parsed.data.id,
    payload: { status: parsed.data.status },
  });
  revalidatePath(`/desk/issues/${parsed.data.id}`);
  revalidatePath("/desk/issues");
  return { ok: true } as const;
}

export async function deleteIssueAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("issue.write");
  const id = fd.get("id")?.toString();
  if (!id) return { ok: false, error: "id 누락" } as const;

  const existing = await db
    .select({ id: issues.id, status: issues.status })
    .from(issues)
    .where(and(eq(issues.id, id)))
    .limit(1);
  if (existing.length === 0) return { ok: false, error: "존재하지 않는 이슈" } as const;
  if (existing[0]!.status === "published") {
    return { ok: false, error: "발행된 이슈는 삭제할 수 없습니다. 아카이브를 이용해 주세요." } as const;
  }

  await db.delete(issues).where(eq(issues.id, id));
  await writeAudit({
    actorUserId: session.user.id,
    action: "issue.delete",
    targetType: "issue",
    targetId: id,
  });
  revalidatePath("/desk/issues");
  redirect("/desk/issues");
}

// ISSUE_PRIORITIES 는 form select 에서 사용되므로 re-export.
export { ISSUE_STATUSES, ISSUE_PRIORITIES };
