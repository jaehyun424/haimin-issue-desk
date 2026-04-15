import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BriefStatusBadge, IssuePriorityBadge, IssueStatusBadge } from "@/components/common/status-badge";
import { SourceList } from "@/components/common/source-list";
import { EmptyState } from "@/components/common/empty-state";
import { db } from "@/lib/db";
import {
  briefs,
  issueCategoryLinks,
  issueCategories,
  issueSourceLinks,
  issues,
  sourceDocuments,
  users,
} from "@/lib/db/schema";
import { requireDeskSession } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { formatKoreanDateTime } from "@/lib/utils";
import { IssueForm } from "../issue-form";
import { LinkSourceForm } from "./link-source-form";
import { DeleteIssueButton } from "./delete-button";

export const metadata = { title: "이슈 상세" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function IssueDetailPage({ params }: Props) {
  const session = await requireDeskSession();
  const { id } = await params;

  const issue = await db
    .select({
      id: issues.id,
      title: issues.title,
      summary: issues.summary,
      status: issues.status,
      priority: issues.priority,
      slug: issues.slug,
      primaryCategoryId: issues.primaryCategoryId,
      ownerUserId: issues.ownerUserId,
      updatedAt: issues.updatedAt,
      ownerName: users.name,
    })
    .from(issues)
    .leftJoin(users, eq(users.id, issues.ownerUserId))
    .where(eq(issues.id, id))
    .limit(1)
    .then((r) => r[0]);

  if (!issue) notFound();

  const [categories, owners, sources, links, relatedBriefs] = await Promise.all([
    db
      .select({ id: issueCategories.id, name: issueCategories.name })
      .from(issueCategories)
      .where(eq(issueCategories.isActive, true))
      .orderBy(issueCategories.sortOrder),
    db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(users.name),
    db
      .select({
        id: sourceDocuments.id,
        title: sourceDocuments.title,
        url: sourceDocuments.url,
        sourceName: sourceDocuments.sourceName,
        sourceType: sourceDocuments.sourceType,
        publishedAt: sourceDocuments.publishedAt,
        isPrimary: issueSourceLinks.isPrimary,
      })
      .from(issueSourceLinks)
      .innerJoin(sourceDocuments, eq(sourceDocuments.id, issueSourceLinks.sourceDocumentId))
      .where(eq(issueSourceLinks.issueId, id))
      .orderBy(desc(issueSourceLinks.isPrimary), desc(issueSourceLinks.relevanceScore)),
    db
      .select({ categoryId: issueCategoryLinks.categoryId })
      .from(issueCategoryLinks)
      .where(eq(issueCategoryLinks.issueId, id)),
    db
      .select({
        id: briefs.id,
        slug: briefs.slug,
        title: briefs.title,
        status: briefs.status,
        updatedAt: briefs.updatedAt,
      })
      .from(briefs)
      .where(eq(briefs.issueId, id))
      .orderBy(desc(briefs.updatedAt)),
  ]);

  const categoryIds = links.map((l) => l.categoryId);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>슬러그: {issue.slug}</span>
            <span aria-hidden>·</span>
            <span>마지막 갱신: {formatKoreanDateTime(issue.updatedAt)}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{issue.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <IssueStatusBadge status={issue.status} />
            <IssuePriorityBadge priority={issue.priority} />
            {issue.ownerName ? (
              <span className="text-xs text-muted-foreground">담당: {issue.ownerName}</span>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/desk/briefs/new?issueId=${issue.id}`}>브리프 작성</Link>
          </Button>
          <DeleteIssueButton id={issue.id} disabled={issue.status === "published"} />
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">이슈 정보 수정</CardTitle>
            </CardHeader>
            <CardContent>
              <IssueForm
                mode="edit"
                categories={categories}
                owners={owners}
                initial={{
                  id: issue.id,
                  title: issue.title,
                  summary: issue.summary,
                  status: issue.status,
                  priority: issue.priority,
                  primaryCategoryId: issue.primaryCategoryId,
                  ownerUserId: issue.ownerUserId,
                  categoryIds,
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">연결된 브리프</CardTitle>
            </CardHeader>
            <CardContent>
              {relatedBriefs.length === 0 ? (
                <EmptyState
                  title="아직 작성된 브리프가 없습니다"
                  description="이 이슈에 대한 공개 브리프 초안을 새로 만들 수 있습니다."
                  action={
                    <Button asChild size="sm">
                      <Link href={`/desk/briefs/new?issueId=${issue.id}`}>초안 작성</Link>
                    </Button>
                  }
                />
              ) : (
                <ul className="space-y-2">
                  {relatedBriefs.map((b) => (
                    <li
                      key={b.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded border border-border px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/desk/briefs/${b.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {b.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {formatKoreanDateTime(b.updatedAt)}
                        </p>
                      </div>
                      <BriefStatusBadge status={b.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">연결 출처 ({sources.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <SourceList items={sources} emptyMessage="아직 연결된 출처가 없습니다." />
              <div className="mt-4 border-t border-border pt-4">
                <LinkSourceForm issueId={issue.id} />
                <p className="mt-2 text-xs text-muted-foreground">
                  사용 중인 출처 ID 는 /desk/sources 에서 확인할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        로그인: {session.user.email} · 역할: {ROLE_LABELS[session.user.role]}
      </p>
    </div>
  );
}
