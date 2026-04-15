import Link from "next/link";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import { FreshnessIndicator } from "@/components/common/freshness-indicator";
import { db } from "@/lib/db";
import { briefs, issueCategories, issues } from "@/lib/db/schema";
import { formatKoreanDate, truncate } from "@/lib/utils";

export const metadata = { title: "브리프 목록" };
export const revalidate = 300;

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function BriefListPage({ searchParams }: Props) {
  const params = await searchParams;
  const [allCategories, rows] = await Promise.all([
    db
      .select({ id: issueCategories.id, name: issueCategories.name })
      .from(issueCategories)
      .where(eq(issueCategories.isActive, true))
      .orderBy(issueCategories.sortOrder),
    db
      .select({
        id: briefs.id,
        slug: briefs.slug,
        title: briefs.title,
        summary: briefs.summary,
        publishedAt: briefs.publishedAt,
        issueId: briefs.issueId,
        categoryName: issueCategories.name,
      })
      .from(briefs)
      .innerJoin(issues, eq(issues.id, briefs.issueId))
      .leftJoin(issueCategories, eq(issueCategories.id, issues.primaryCategoryId))
      .where(
        and(
          eq(briefs.status, "published"),
          params.q ? ilike(briefs.title, `%${params.q}%`) : sql`true`,
          params.category ? eq(issueCategories.name, params.category) : sql`true`,
        ),
      )
      .orderBy(desc(briefs.publishedAt))
      .limit(50),
  ]);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">브리프 목록</h1>
        <p className="max-w-2xl text-muted-foreground">
          이해민 의원실이 정리한 과방위 현안 브리프입니다. 제목으로 검색하거나 카테고리로 필터링할
          수 있습니다.
        </p>
        <form className="flex flex-wrap gap-2" action="/brief" method="get">
          <input
            type="text"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="제목 검색"
            className="h-10 w-full max-w-xs rounded-md border border-input bg-background px-3"
            aria-label="브리프 검색"
          />
          <select
            name="category"
            defaultValue={params.category ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="카테고리 선택"
          >
            <option value="">전체 카테고리</option>
            {allCategories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            검색
          </button>
        </form>
      </header>

      <Section title={`${rows.length}건`}>
        {rows.length === 0 ? (
          <EmptyState
            title="조건에 맞는 브리프가 없습니다"
            description="검색어나 카테고리를 바꿔 보시거나, 전체 목록에서 탐색해 주세요."
          />
        ) : (
          <ul className="grid gap-4">
            {rows.map((b) => (
              <li key={b.id}>
                <Card>
                  <CardContent className="flex flex-col gap-2 p-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {b.categoryName ? <Badge variant="outline">{b.categoryName}</Badge> : null}
                      <span>{formatKoreanDate(b.publishedAt)}</span>
                      <FreshnessIndicator
                        label="발행"
                        value={b.publishedAt}
                        variant="relative"
                      />
                    </div>
                    <h2 className="text-xl font-semibold leading-snug">
                      <Link href={`/brief/issues/${b.slug}`} className="hover:underline">
                        {b.title}
                      </Link>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {truncate(b.summary, 220)}
                    </p>
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
