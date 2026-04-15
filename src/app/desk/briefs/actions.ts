"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { briefs, issueSourceLinks, issues } from "@/lib/db/schema";
import { requireCapability } from "@/lib/auth/session";
import { writeAudit } from "@/lib/audit";
import { koreanSlug } from "@/lib/utils";
import { briefCreateSchema, briefUpdateSchema, BRIEF_STATUSES } from "@/lib/validation/brief";
import { uuid } from "@/lib/validation/common";
import { FLAG, getFlag } from "@/lib/feature-flags";

async function generateBriefSlug(title: string): Promise<string> {
  const base = koreanSlug(title) || "brief";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${Date.now().toString(36).slice(-4)}`;
    const found = await db
      .select({ id: briefs.id })
      .from(briefs)
      .where(eq(briefs.slug, candidate))
      .limit(1);
    if (found.length === 0) return candidate;
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function createBriefAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("brief.draft");
  const parsed = briefCreateSchema.safeParse({
    issueId: fd.get("issueId")?.toString(),
    title: fd.get("title")?.toString(),
    summary: fd.get("summary")?.toString(),
    bodyMd: fd.get("bodyMd")?.toString(),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력 오류" } as const;
  }

  const slug = await generateBriefSlug(parsed.data.title);
  const [created] = await db
    .insert(briefs)
    .values({
      issueId: parsed.data.issueId,
      slug,
      title: parsed.data.title,
      summary: parsed.data.summary,
      bodyMd: parsed.data.bodyMd,
      status: "draft",
      createdByUserId: session.user.id,
    })
    .returning({ id: briefs.id });

  await writeAudit({
    actorUserId: session.user.id,
    action: "brief.create",
    targetType: "brief",
    targetId: created?.id ?? null,
    payload: { issueId: parsed.data.issueId },
  });

  revalidatePath("/desk/briefs");
  redirect(`/desk/briefs/${created?.id ?? ""}`);
}

export async function updateBriefAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("brief.draft");
  const parsed = briefUpdateSchema.safeParse({
    id: fd.get("id")?.toString(),
    title: fd.get("title")?.toString(),
    summary: fd.get("summary")?.toString(),
    bodyMd: fd.get("bodyMd")?.toString(),
    issueId: fd.get("issueId")?.toString(),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력 오류" } as const;
  }
  const { id, ...rest } = parsed.data;
  await db
    .update(briefs)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(briefs.id, id));

  await writeAudit({
    actorUserId: session.user.id,
    action: "brief.update",
    targetType: "brief",
    targetId: id,
    payload: { changedFields: Object.keys(rest) },
  });
  revalidatePath(`/desk/briefs/${id}`);
  return { ok: true } as const;
}

const transitionSchema = z.object({
  id: uuid,
  status: z.enum(BRIEF_STATUSES),
});

export async function transitionBriefAction(_prev: unknown, fd: FormData) {
  const targetStatus = fd.get("status")?.toString();
  const id = fd.get("id")?.toString();
  const parsed = transitionSchema.safeParse({ id, status: targetStatus });
  if (!parsed.success) return { ok: false, error: "잘못된 상태 값" } as const;

  // 상태에 따라 다른 권한 필요
  const required =
    parsed.data.status === "published"
      ? ("brief.publish" as const)
      : parsed.data.status === "review"
        ? ("brief.draft" as const)
        : parsed.data.status === "archived"
          ? ("brief.review" as const)
          : ("brief.draft" as const);

  const session = await requireCapability(required);

  const current = await db
    .select({
      id: briefs.id,
      issueId: briefs.issueId,
      status: briefs.status,
      title: briefs.title,
      summary: briefs.summary,
      bodyMd: briefs.bodyMd,
    })
    .from(briefs)
    .where(eq(briefs.id, parsed.data.id))
    .limit(1)
    .then((r) => r[0]);
  if (!current) return { ok: false, error: "존재하지 않는 브리프" } as const;

  if (parsed.data.status === "published") {
    // 발행 조건 검증:
    //  1) 요약/본문 최소 길이
    //  2) 최소 1건의 출처 연결
    //  3) election_mode ON 이면 reviewer 가 아닌 draft 상태에서 바로 발행 금지
    if ((current.summary?.length ?? 0) < 10 || (current.bodyMd?.length ?? 0) < 20) {
      return { ok: false, error: "요약/본문이 너무 짧습니다." } as const;
    }
    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(issueSourceLinks)
      .where(eq(issueSourceLinks.issueId, current.issueId));
    const sourceCount = countRow?.count ?? 0;
    if (sourceCount < 1) {
      return {
        ok: false,
        error: "공개 브리프는 최소 1건 이상의 연결 출처가 필요합니다.",
      } as const;
    }
    const electionOn = await getFlag(FLAG.ELECTION_MODE);
    if (electionOn && current.status !== "review") {
      return {
        ok: false,
        error: "선거모드 동안에는 reviewer 검토(review 상태)를 거쳐야 발행할 수 있습니다.",
      } as const;
    }
  }

  const now = new Date();
  const patch: Partial<typeof briefs.$inferInsert> = {
    status: parsed.data.status,
    updatedAt: now,
  };
  if (parsed.data.status === "published") {
    patch.publishedAt = now;
    patch.lastVerifiedAt = now;
    patch.reviewerUserId = session.user.id;
  } else if (parsed.data.status === "archived") {
    patch.reviewerUserId = session.user.id;
  }
  await db.update(briefs).set(patch).where(eq(briefs.id, parsed.data.id));

  // 이슈 상태도 업데이트:
  //  - brief published → issues.status = 'published'
  //  - brief review → issues.status = 'ready_to_publish'
  if (parsed.data.status === "published") {
    await db
      .update(issues)
      .set({ status: "published", updatedAt: now })
      .where(eq(issues.id, current.issueId));
  } else if (parsed.data.status === "review") {
    await db
      .update(issues)
      .set({ status: "ready_to_publish", updatedAt: now })
      .where(and(eq(issues.id, current.issueId)));
  }

  const actionKey =
    parsed.data.status === "review"
      ? "brief.submit_review"
      : parsed.data.status === "published"
        ? "brief.publish"
        : parsed.data.status === "archived"
          ? "brief.archive"
          : "brief.update";

  await writeAudit({
    actorUserId: session.user.id,
    action: actionKey,
    targetType: "brief",
    targetId: parsed.data.id,
    payload: { from: current.status, to: parsed.data.status },
  });

  revalidatePath(`/desk/briefs/${parsed.data.id}`);
  revalidatePath("/desk/briefs");
  revalidatePath("/brief");
  return { ok: true } as const;
}
