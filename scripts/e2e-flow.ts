/**
 * E2E 플로우 검증 스크립트.
 *
 * 목적: 서버 액션이 통과시키는 비즈니스 규칙을 DB 레벨에서 똑같이 실행하고,
 * 최종적으로 공개 /brief 페이지 쿼리로도 나타나는지 확인한다.
 *
 * 실행:
 *   npx tsx --env-file-if-exists=.env.local scripts/e2e-flow.ts
 *
 * 이 스크립트는 멱등이 아니다. 매 실행마다 새 데이터가 추가된다.
 */
import { createHash } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  briefs,
  featureFlags,
  issueCategories,
  issueSourceLinks,
  issues,
  sourceDocuments,
  users,
  auditLogs,
} from "@/lib/db/schema";
import { koreanSlug } from "@/lib/utils";
import { FLAG } from "@/lib/constants/feature-flags";

type StepResult = { step: string; ok: boolean; detail: string };
const results: StepResult[] = [];

function record(step: string, ok: boolean, detail: string) {
  results.push({ step, ok, detail });
  const icon = ok ? "✓" : "✗";
  console.log(`${icon} [${step}] ${detail}`);
}

async function getAdmin() {
  const [admin] = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@haimin.local"))
    .limit(1);
  if (!admin) throw new Error("admin 계정을 찾을 수 없습니다. db:seed 를 먼저 실행하세요.");
  return admin;
}

async function genUniqueSlug(prefix: string, checker: (slug: string) => Promise<boolean>) {
  const base = koreanSlug(prefix) || "item";
  for (let i = 0; i < 5; i += 1) {
    const candidate = i === 0 ? base : `${base}-${Date.now().toString(36).slice(-4)}-${i}`;
    if (await checker(candidate)) return candidate;
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

async function writeAudit(actorUserId: string, action: string, targetType: string, targetId: string | null, payload?: Record<string, unknown>) {
  await db.insert(auditLogs).values({
    actorUserId,
    action,
    targetType,
    targetId,
    payloadJson: payload ?? null,
  });
}

async function main() {
  console.log("=== E2E 플로우 시작 ===\n");
  const admin = await getAdmin();
  record("setup", true, `admin=${admin.email} (role=${admin.role})`);

  // 선거모드 플래그 확인
  const [flagRow] = await db
    .select()
    .from(featureFlags)
    .where(eq(featureFlags.key, FLAG.ELECTION_MODE))
    .limit(1);
  const electionOn = flagRow?.enabled ?? true;
  record("flag.election_mode", true, `election_mode=${electionOn}`);

  // 카테고리 하나 고르기 (AI·데이터·고영향 AI)
  const [category] = await db
    .select()
    .from(issueCategories)
    .where(eq(issueCategories.name, "AI·데이터·고영향 AI"))
    .limit(1);
  if (!category) {
    record("category.pick", false, "AI 카테고리를 찾지 못함");
    throw new Error("카테고리 없음");
  }
  record("category.pick", true, `카테고리: ${category.name}`);

  // =============== 1) 이슈 생성 ===============
  const issueTitle = `[E2E ${new Date().toISOString().slice(11, 19)}] 고영향 AI 영향평가 고시 제정 동향`;
  const issueSlug = await genUniqueSlug(issueTitle, async (candidate) => {
    const found = await db.select({ id: issues.id }).from(issues).where(eq(issues.slug, candidate)).limit(1);
    return found.length === 0;
  });
  const [createdIssue] = await db
    .insert(issues)
    .values({
      slug: issueSlug,
      title: issueTitle,
      summary: "과기정통부가 고영향 AI 영향평가 고시 제정안을 예고함. 업계·시민사회 의견 수렴 중.",
      status: "reviewing",
      priority: "high",
      primaryCategoryId: category.id,
      ownerUserId: admin.id,
    })
    .returning();
  if (!createdIssue) {
    record("1.issue.create", false, "이슈 insert 실패");
    throw new Error("issue insert 실패");
  }
  await writeAudit(admin.id, "issue.create", "issue", createdIssue.id, {
    status: createdIssue.status,
  });
  record("1.issue.create", true, `id=${createdIssue.id.slice(0, 8)} slug=${createdIssue.slug}`);

  // =============== 2) 수기 소스 1건 등록 ===============
  const now = new Date();
  const sourceTitle = "AI 기본법 시행을 위한 하위법령 제정방안 공청회";
  const sourceUrl = "https://www.msit.go.kr/bbs/view.do?sCode=user&mId=113&bbsSeqNo=94";
  const hash = createHash("sha256")
    .update([sourceUrl, sourceTitle, now.toISOString()].join("|"))
    .digest("hex")
    .slice(0, 40);
  const [createdSource] = await db
    .insert(sourceDocuments)
    .values({
      sourceType: "manual",
      sourceName: "과학기술정보통신부",
      title: sourceTitle,
      url: sourceUrl,
      bodyText: "요약: 과기정통부가 4월 30일 고영향 AI 영향평가 고시(안) 공청회를 개최.",
      publishedAt: new Date("2026-04-15T09:00:00+09:00"),
      fetchedAt: now,
      hash,
      metadataJson: { createdBy: admin.id, createdVia: "e2e.script" },
    })
    .returning();
  if (!createdSource) {
    record("2.source.create", false, "insert 실패");
    throw new Error("source insert 실패");
  }
  await writeAudit(admin.id, "source.create", "source_document", createdSource.id, {
    sourceName: createdSource.sourceName,
  });
  record("2.source.create", true, `id=${createdSource.id.slice(0, 8)} url=${createdSource.url}`);

  // =============== 3) 이슈↔소스 연결 ===============
  const [link] = await db
    .insert(issueSourceLinks)
    .values({
      issueId: createdIssue.id,
      sourceDocumentId: createdSource.id,
      isPrimary: true,
      relevanceScore: 100,
    })
    .returning();
  if (!link) {
    record("3.source.link", false, "link insert 실패");
    throw new Error("link 실패");
  }
  await writeAudit(admin.id, "source.link", "issue", createdIssue.id, {
    sourceDocumentId: createdSource.id,
  });
  record("3.source.link", true, `link id=${link.id.slice(0, 8)} primary=${link.isPrimary}`);

  // =============== 4) 브리프 초안 생성 ===============
  const briefTitle = `${issueTitle} — 의원실 브리프`;
  const briefSlug = await genUniqueSlug(briefTitle, async (candidate) => {
    const found = await db.select({ id: briefs.id }).from(briefs).where(eq(briefs.slug, candidate)).limit(1);
    return found.length === 0;
  });
  const bodyMd = [
    "## 이슈 개요",
    "과기정통부는 2026-04-15, AI 기본법 시행을 위한 하위법령(고영향 AI 영향평가 고시) 공청회를 개최했다.",
    "",
    "## 현재 상황",
    "- 영향평가 대상, 평가 주체, 공개 범위에 대한 쟁점 존재",
    "- 업계는 평가 비용·일정 예측가능성을, 시민사회는 투명성·외부 감시를 요구",
    "",
    "## 이해민 의원실 관련 활동",
    "- 과방위 법안소위 논의 예정",
    "- 의원실 정책 메모 작성 중",
    "",
    "## 관련 법안/표결/회의/발언",
    "- AI기본법 2조(고영향 AI 정의)",
    "- 제1소위 회의록 (2026-04-15)",
    "",
    "## 참고한 공식 자료",
    "- [과기정통부 공청회 공지](https://www.msit.go.kr/bbs/view.do?sCode=user&mId=113&bbsSeqNo=94)",
  ].join("\n");
  const [createdBrief] = await db
    .insert(briefs)
    .values({
      issueId: createdIssue.id,
      slug: briefSlug,
      title: briefTitle,
      summary: "과기정통부 고영향 AI 영향평가 고시 공청회 주요 쟁점을 정리. 업계·시민사회 의견 대립.",
      bodyMd,
      status: "draft",
      createdByUserId: admin.id,
    })
    .returning();
  if (!createdBrief) {
    record("4.brief.create", false, "insert 실패");
    throw new Error("brief insert 실패");
  }
  await writeAudit(admin.id, "brief.create", "brief", createdBrief.id, {
    issueId: createdIssue.id,
  });
  record("4.brief.create", true, `id=${createdBrief.id.slice(0, 8)} slug=${createdBrief.slug} status=draft`);

  // =============== 5) draft → review ===============
  await db
    .update(briefs)
    .set({ status: "review", updatedAt: new Date() })
    .where(eq(briefs.id, createdBrief.id));
  await db
    .update(issues)
    .set({ status: "ready_to_publish", updatedAt: new Date() })
    .where(eq(issues.id, createdIssue.id));
  await writeAudit(admin.id, "brief.submit_review", "brief", createdBrief.id, {
    from: "draft",
    to: "review",
  });
  record("5.brief.submit_review", true, "draft → review. 이슈 상태 → ready_to_publish");

  // =============== 6) review → published (사전 가드 체크) ===============
  // 가드 1: summary ≥10, body ≥20
  const [beforePublish] = await db
    .select({
      id: briefs.id,
      status: briefs.status,
      issueId: briefs.issueId,
      summary: briefs.summary,
      bodyMd: briefs.bodyMd,
    })
    .from(briefs)
    .where(eq(briefs.id, createdBrief.id))
    .limit(1);
  if (!beforePublish) throw new Error("브리프 재조회 실패");
  const lenOk =
    (beforePublish.summary?.length ?? 0) >= 10 && (beforePublish.bodyMd?.length ?? 0) >= 20;
  record(
    "6a.guard.length",
    lenOk,
    `summary=${beforePublish.summary?.length ?? 0}자 / body=${beforePublish.bodyMd?.length ?? 0}자`,
  );
  if (!lenOk) throw new Error("guard.length 실패");

  // 가드 2: 출처 ≥1
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(issueSourceLinks)
    .where(eq(issueSourceLinks.issueId, beforePublish.issueId));
  const sourceOk = (count ?? 0) >= 1;
  record("6b.guard.source>=1", sourceOk, `연결 출처 ${count}건`);
  if (!sourceOk) throw new Error("guard.source 실패");

  // 가드 3: election_mode ON 이면 review 경유 필수 → 현재 상태 review 이므로 OK
  const electionGateOk = !electionOn || beforePublish.status === "review";
  record(
    "6c.guard.election",
    electionGateOk,
    `election=${electionOn}, 상태=${beforePublish.status}`,
  );
  if (!electionGateOk) throw new Error("guard.election 실패");

  // 실 발행
  const pubAt = new Date();
  await db
    .update(briefs)
    .set({
      status: "published",
      publishedAt: pubAt,
      lastVerifiedAt: pubAt,
      reviewerUserId: admin.id,
      updatedAt: pubAt,
    })
    .where(eq(briefs.id, createdBrief.id));
  await db
    .update(issues)
    .set({ status: "published", updatedAt: pubAt })
    .where(eq(issues.id, createdIssue.id));
  await writeAudit(admin.id, "brief.publish", "brief", createdBrief.id, {
    from: "review",
    to: "published",
  });
  record("6d.brief.publish", true, `published_at=${pubAt.toISOString()}`);

  // =============== 7) 공개 페이지 쿼리 검증 ===============
  // (public)/brief/page.tsx 와 동일한 where 조합
  const publicRow = await db
    .select({
      id: briefs.id,
      slug: briefs.slug,
      title: briefs.title,
      categoryName: issueCategories.name,
    })
    .from(briefs)
    .innerJoin(issues, eq(issues.id, briefs.issueId))
    .leftJoin(issueCategories, eq(issueCategories.id, issues.primaryCategoryId))
    .where(and(eq(briefs.status, "published"), eq(briefs.id, createdBrief.id)))
    .orderBy(desc(briefs.publishedAt))
    .limit(1)
    .then((rows) => rows[0]);
  record(
    "7.public.visible",
    !!publicRow,
    publicRow ? `공개 쿼리에서 발견: ${publicRow.slug} / ${publicRow.categoryName ?? "(카테고리 없음)"}` : "공개 쿼리에 없음",
  );
  if (!publicRow) throw new Error("public 쿼리에서 brief 가 안 보임");

  // =============== 8) 감사 로그 수 확인 ===============
  const auditCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.actorUserId, admin.id),
        sql`${auditLogs.createdAt} > now() - interval '1 minute'`,
      ),
    )
    .then((r) => r[0]?.count ?? 0);
  record("8.audit.rows", auditCount >= 6, `이 실행에서 생성된 audit log: ${auditCount}건`);

  // 요약
  console.log("\n=== 요약 ===");
  const failed = results.filter((r) => !r.ok);
  console.log(`총 ${results.length}단계 · 성공 ${results.length - failed.length} · 실패 ${failed.length}`);
  if (failed.length > 0) {
    console.log("실패 항목:");
    for (const f of failed) console.log(` - ${f.step}: ${f.detail}`);
    process.exit(1);
  }
  console.log("모든 단계 성공 ✅");
  console.log(`\n공개 URL: http://localhost:3000/brief/issues/${createdBrief.slug}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("\n✗ 예외로 중단:", err);
  console.log("\n=== 요약 ===");
  console.log(`총 ${results.length}단계 · 성공 ${results.filter((r) => r.ok).length} · 실패 ${results.filter((r) => !r.ok).length}`);
  process.exit(1);
});
