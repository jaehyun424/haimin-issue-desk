import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { db } from "@/lib/db";
import { briefs, issueCategories, issues } from "@/lib/db/schema";
import { formatKoreanDate, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [recent, categories] = await Promise.all([
    db
      .select({
        id: briefs.id,
        slug: briefs.slug,
        title: briefs.title,
        summary: briefs.summary,
        publishedAt: briefs.publishedAt,
        categoryName: issueCategories.name,
      })
      .from(briefs)
      .innerJoin(issues, eq(issues.id, briefs.issueId))
      .leftJoin(issueCategories, eq(issueCategories.id, issues.primaryCategoryId))
      .where(eq(briefs.status, "published"))
      .orderBy(desc(briefs.publishedAt))
      .limit(6),
    db
      .select({ id: issueCategories.id, name: issueCategories.name })
      .from(issueCategories)
      .where(eq(issueCategories.isActive, true))
      .orderBy(issueCategories.sortOrder),
  ]);

  return (
    <div className="space-y-14">
      {/* Hero — 공공기관 톤: 기관명, 제목, 부제 */}
      <section className="border-b border-border pb-10">
        <p className="kicker">과학기술정보방송통신위원회</p>
        <h1 className="mt-4 max-w-3xl">
          이해민 의원실의 과방위 의정 브리프
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
          국회 공식 데이터와 정부·유관기관 자료를 기반으로, 의원실 편집자가 작성하고
          검토자가 승인한 현안 정리를 공개합니다. 마지막 검증 시각과 출처 링크를 모든
          글에 함께 표기합니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/brief">브리프 목록</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/brief/activity">의정활동 타임라인</Link>
          </Button>
        </div>
      </section>

      {/* Recent briefs */}
      <section>
        <header className="flex items-end justify-between border-b border-foreground/80 pb-2">
          <h2>최근 브리프</h2>
          <Link
            href="/brief"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            전체 목록
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </header>
        {recent.length === 0 ? (
          <div className="pt-6">
            <EmptyState
              title="아직 발행된 브리프가 없습니다"
              description="편집자가 작성하고 검토자가 승인하면 이곳에 공개됩니다."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/brief/issues/${encodeURIComponent(b.slug)}`}
                  className="grid gap-3 py-5 transition-colors hover:bg-muted/40 sm:grid-cols-[140px_1fr_auto] sm:items-baseline sm:gap-6"
                >
                  <div className="text-sm text-muted-foreground">
                    <time>{formatKoreanDate(b.publishedAt)}</time>
                    {b.categoryName ? (
                      <span className="ml-3 border-l border-border pl-3">
                        {b.categoryName}
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold leading-snug text-foreground">
                      {b.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {truncate(b.summary, 160)}
                    </p>
                  </div>
                  <ChevronRight
                    className="hidden h-4 w-4 text-muted-foreground sm:block"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Categories */}
      <section>
        <header className="border-b border-foreground/80 pb-2">
          <h2>카테고리</h2>
        </header>
        <ul className="mt-5 flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/brief?category=${encodeURIComponent(c.name)}`}
                className="btn-chip"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Principles */}
      <section>
        <header className="border-b border-foreground/80 pb-2">
          <h2>편집 원칙</h2>
        </header>
        <dl className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-3">
          <div>
            <dt className="eyebrow">01. 출처 우선</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
              국회·정부 Open API 와 유관기관 보고서를 1순위 출처로 사용합니다.
            </dd>
          </div>
          <div>
            <dt className="eyebrow">02. 검수 필수</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
              편집자가 초안을 쓰고 검토자가 승인한 글만 공개됩니다. AI 자동 발행은
              하지 않습니다.
            </dd>
          </div>
          <div>
            <dt className="eyebrow">03. 사실 중심</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
              자극적 제목·경쟁 후보 비교·지지 호소 카피를 사용하지 않습니다.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
