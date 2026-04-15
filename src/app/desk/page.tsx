import Link from "next/link";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import { FreshnessIndicator } from "@/components/common/freshness-indicator";
import { IssueStatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { briefs, issues, sourceDocuments } from "@/lib/db/schema";
import { requireDeskSession } from "@/lib/auth/session";
import { formatKoreanDateTime } from "@/lib/utils";

export const metadata = { title: "Desk 대시보드" };

export default async function DeskHome() {
  await requireDeskSession();

  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const [newSources, reviewingIssues, readyBriefs, latestIssues, latestSources] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(sourceDocuments)
        .where(gte(sourceDocuments.fetchedAt, since))
        .then((r) => r[0]?.count ?? 0),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(issues)
        .where(inArray(issues.status, ["new", "reviewing"]))
        .then((r) => r[0]?.count ?? 0),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(briefs)
        .where(eq(briefs.status, "review"))
        .then((r) => r[0]?.count ?? 0),
      db
        .select({
          id: issues.id,
          title: issues.title,
          status: issues.status,
          updatedAt: issues.updatedAt,
        })
        .from(issues)
        .orderBy(desc(issues.updatedAt))
        .limit(6),
      db
        .select({
          id: sourceDocuments.id,
          title: sourceDocuments.title,
          sourceName: sourceDocuments.sourceName,
          fetchedAt: sourceDocuments.fetchedAt,
        })
        .from(sourceDocuments)
        .orderBy(desc(sourceDocuments.fetchedAt))
        .limit(6),
    ]);
  void and;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
        <p className="text-sm text-muted-foreground">
          과방위 현안 운영 현황을 한눈에 봅니다.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              최근 7일 수집 소스
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{newSources}</p>
            <p className="text-xs text-muted-foreground">
              자동 파이프라인 + 수기 입력 합계
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">검토 대기 이슈</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{reviewingIssues}</p>
            <p className="text-xs text-muted-foreground">
              상태: 신규 · 검토중
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">발행 대기 브리프</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{readyBriefs}</p>
            <p className="text-xs text-muted-foreground">reviewer 승인 대기</p>
          </CardContent>
        </Card>
      </section>

      <Section
        title="최근 이슈"
        actions={
          <Button asChild size="sm" variant="ghost">
            <Link href="/desk/issues">전체 보기 →</Link>
          </Button>
        }
      >
        {latestIssues.length === 0 ? (
          <EmptyState
            title="아직 이슈가 없습니다"
            description="수집 문서에서 이슈를 생성하거나, 직접 새 이슈를 등록해 보세요."
            action={
              <Button asChild size="sm">
                <Link href="/desk/issues/new">새 이슈 만들기</Link>
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {latestIssues.map((i) => (
              <li key={i.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/desk/issues/${i.id}`}
                        className="text-base font-medium hover:underline"
                      >
                        {i.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatKoreanDateTime(i.updatedAt)}
                      </p>
                    </div>
                    <IssueStatusBadge status={i.status} />
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="최근 수집 소스"
        actions={
          <Button asChild size="sm" variant="ghost">
            <Link href="/desk/sources">전체 보기 →</Link>
          </Button>
        }
      >
        {latestSources.length === 0 ? (
          <EmptyState title="아직 수집된 소스가 없습니다" />
        ) : (
          <ul className="space-y-2">
            {latestSources.map((s) => (
              <li key={s.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.sourceName}</p>
                    </div>
                    <FreshnessIndicator label="수집" value={s.fetchedAt} />
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>

    </div>
  );
}
