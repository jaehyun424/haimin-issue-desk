import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { desc, eq, gte, inArray, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { FreshnessIndicator } from "@/components/common/freshness-indicator";
import { IssueStatusBadge } from "@/components/common/status-badge";
import { db } from "@/lib/db";
import { briefs, issues, sourceDocuments } from "@/lib/db/schema";
import { requireDeskSession } from "@/lib/auth/session";
import { formatKoreanDate, formatKoreanDateTime } from "@/lib/utils";

export const metadata = { title: "Desk 대시보드" };

export default async function DeskHome() {
  const session = await requireDeskSession();

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

  const now = new Date();

  const stats = [
    {
      label: "최근 7일 수집 소스",
      value: newSources,
      hint: "자동 파이프라인 + 수기 입력 합계",
      href: "/desk/sources",
    },
    {
      label: "검토 대기 이슈",
      value: reviewingIssues,
      hint: "상태: 신규 · 검토중",
      href: "/desk/issues?status=reviewing",
    },
    {
      label: "발행 대기 브리프",
      value: readyBriefs,
      hint: "reviewer 승인 대기",
      href: "/desk/briefs?status=review",
    },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
        <div>
          <p className="kicker">데스크</p>
          <h1 className="mt-2">대시보드</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatKoreanDate(now)} · {session.user.name || "담당자"}님 ({session.user.role})
          </p>
        </div>
        <Button asChild>
          <Link href="/desk/issues/new">새 이슈 만들기</Link>
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="stat-tile hover:border-foreground/30">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
            </div>
            <p className="mt-4 text-[2rem] font-semibold leading-none tabular-nums">
              {s.value}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{s.hint}</p>
          </Link>
        ))}
      </section>

      <section>
        <header className="flex items-end justify-between border-b border-foreground/80 pb-2">
          <h2>최근 이슈</h2>
          <Link
            href="/desk/issues"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            전체 →
          </Link>
        </header>
        {latestIssues.length === 0 ? (
          <div className="pt-6">
            <EmptyState
              title="아직 이슈가 없습니다"
              description="수집 문서에서 이슈를 생성하거나, 직접 새 이슈를 등록해 보세요."
              action={
                <Button asChild size="sm">
                  <Link href="/desk/issues/new">새 이슈 만들기</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {latestIssues.map((i) => (
              <li key={i.id}>
                <Link
                  href={`/desk/issues/${i.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium">{i.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatKoreanDateTime(i.updatedAt)}
                    </p>
                  </div>
                  <IssueStatusBadge status={i.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <header className="flex items-end justify-between border-b border-foreground/80 pb-2">
          <h2>최근 수집 소스</h2>
          <Link
            href="/desk/sources"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            전체 →
          </Link>
        </header>
        {latestSources.length === 0 ? (
          <div className="pt-6">
            <EmptyState title="아직 수집된 소스가 없습니다" />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {latestSources.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.sourceName}</p>
                </div>
                <FreshnessIndicator label="수집" value={s.fetchedAt} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
