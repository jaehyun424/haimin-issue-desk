"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { issueSourceLinks, sourceDocuments } from "@/lib/db/schema";
import { requireCapability } from "@/lib/auth/session";
import { writeAudit } from "@/lib/audit";
import { sourceCreateSchema, sourceLinkSchema } from "@/lib/validation/source";

function hashSource(opts: { url?: string; title: string; publishedAt?: Date | null }) {
  return createHash("sha256")
    .update([opts.url ?? "", opts.title, opts.publishedAt?.toISOString() ?? ""].join("|"))
    .digest("hex")
    .slice(0, 40);
}

export async function createSourceAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("source.write");
  const raw = {
    sourceType: fd.get("sourceType")?.toString() ?? "manual",
    sourceName: fd.get("sourceName")?.toString() ?? "",
    title: fd.get("title")?.toString() ?? "",
    url: fd.get("url")?.toString() ?? "",
    bodyText: fd.get("bodyText")?.toString() ?? "",
    externalId: fd.get("externalId")?.toString() ?? "",
    publishedAt: fd.get("publishedAt")?.toString() ?? "",
  };
  const parsed = sourceCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력 오류" } as const;
  }
  const publishedAt = parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null;
  const hash = hashSource({
    url: parsed.data.url || undefined,
    title: parsed.data.title,
    publishedAt: publishedAt ?? null,
  });

  const [created] = await db
    .insert(sourceDocuments)
    .values({
      sourceType: parsed.data.sourceType,
      sourceName: parsed.data.sourceName,
      title: parsed.data.title,
      url: parsed.data.url || null,
      bodyText: parsed.data.bodyText || null,
      externalId: parsed.data.externalId || null,
      publishedAt,
      fetchedAt: new Date(),
      hash,
      metadataJson: { createdBy: session.user.id, createdVia: "desk.manual" },
    })
    .returning({ id: sourceDocuments.id });

  await writeAudit({
    actorUserId: session.user.id,
    action: "source.create",
    targetType: "source_document",
    targetId: created?.id ?? null,
    payload: { sourceName: parsed.data.sourceName, type: parsed.data.sourceType },
  });

  revalidatePath("/desk/sources");
  return { ok: true, id: created?.id } as const;
}

export async function linkSourceAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("source.write");
  const parsed = sourceLinkSchema.safeParse({
    issueId: fd.get("issueId")?.toString(),
    sourceDocumentId: fd.get("sourceDocumentId")?.toString(),
    isPrimary: fd.get("isPrimary") === "true",
  });
  if (!parsed.success) {
    return { ok: false, error: "잘못된 입력입니다." } as const;
  }
  // 중복 방지
  const existing = await db
    .select({ id: issueSourceLinks.id })
    .from(issueSourceLinks)
    .where(
      and(
        eq(issueSourceLinks.issueId, parsed.data.issueId),
        eq(issueSourceLinks.sourceDocumentId, parsed.data.sourceDocumentId),
      ),
    )
    .limit(1);
  if (existing.length === 0) {
    await db.insert(issueSourceLinks).values({
      issueId: parsed.data.issueId,
      sourceDocumentId: parsed.data.sourceDocumentId,
      isPrimary: parsed.data.isPrimary,
      relevanceScore: parsed.data.isPrimary ? 100 : 50,
    });
  } else if (parsed.data.isPrimary) {
    await db
      .update(issueSourceLinks)
      .set({ isPrimary: true, relevanceScore: 100 })
      .where(eq(issueSourceLinks.id, existing[0]!.id));
  }

  await writeAudit({
    actorUserId: session.user.id,
    action: "source.link",
    targetType: "issue",
    targetId: parsed.data.issueId,
    payload: { sourceDocumentId: parsed.data.sourceDocumentId },
  });
  revalidatePath(`/desk/issues/${parsed.data.issueId}`);
  return { ok: true } as const;
}

export async function unlinkSourceAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("source.write");
  const issueId = fd.get("issueId")?.toString();
  const sourceDocumentId = fd.get("sourceDocumentId")?.toString();
  if (!issueId || !sourceDocumentId) return { ok: false, error: "필수 값 누락" } as const;

  await db
    .delete(issueSourceLinks)
    .where(
      and(
        eq(issueSourceLinks.issueId, issueId),
        eq(issueSourceLinks.sourceDocumentId, sourceDocumentId),
      ),
    );
  await writeAudit({
    actorUserId: session.user.id,
    action: "source.update",
    targetType: "issue",
    targetId: issueId,
    payload: { unlinked: sourceDocumentId },
  });
  revalidatePath(`/desk/issues/${issueId}`);
  return { ok: true } as const;
}
