import Link from "next/link";
import { ArrowRight, Calendar, FileText, Sparkles } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { ElectionBanner } from "@/components/common/election-banner";
import { Section } from "@/components/common/section";
import { db } from "@/lib/db";
import { briefs, issueCategories, issues } from "@/lib/db/schema";
import { FLAG, getFlags } from "@/lib/feature-flags";
import { formatKoreanDate, relativeFromNow, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [flags, recent, categories] = await Promise.all([
    getFlags([FLAG.ELECTION_MODE]).catch(() => ({ [FLAG.ELECTION_MODE]: false })),
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
      .limit(4),
    db
      .select({ id: issueCategories.id, name: issueCategories.name })
      .from(issueCategories)
      .where(eq(issueCategories.isActive, true))
      .orderBy(issueCategories.sortOrder),
  ]);

  return (
    <div className="space-y-20">
      <ElectionBanner enabled={flags[FLAG.ELECTION_MODE]} />

      {/* ---- Hero ---- */}
      <section className="relative -mx-4 overflow-hidden rounded-3xl px-4 py-16 sm:mx-0 sm:px-12 sm:py-24">
        <div
          aria-hidden
          className="absolute inset-0 gradient-paper"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        />
        <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-flat">
              <Sparkles className="h-3 w-3 text-primary" aria-hidden />
              과학기술정보방송통신위원회
            </div>
            <h1 className="text-balance text-4xl font-semibold leading-[1.2] tracking-tight sm:text-5xl">
              의원실이 추적하는<br />
              <span className="bg-gradient-to-br from-[hsl(var(--gov-navy))] to-[hsl(var(--gov-blue))] bg-clip-text text-transparent">
                과방위 현안
              </span>
              , 사실 그대로.
            </h1>
            <p className="max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              이해민 의원실이 국회 공식 데이터와 정부·유관기관 자료를 기반으로 정리한
              과방위 현안 브리프입니다. 편집자 작성 → 검토자 승인 단계를 거친 자료만
              공개되며, 마지막 검증 시각과 출처를 항상 함께 표기합니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-soft">
                <Link href="/brief">
                  최신 브리프 보기
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/brief/activity">
                  <Calendar className="mr-1 h-4 w-4" aria-hidden />
                  의정활동 타임라인
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="card-line relative overflow-hidden p-6 shadow-lift">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  이번 주 추적
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  LIVE
                </Badge>
              </div>
              <div className="mt-5 space-y-4">
                {recent.slice(0, 3).map((b) => (
                  <div key={b.id} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {b.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {b.categoryName ?? "-"} · {relativeFromNow(b.publishedAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {recent.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    아직 발행된 브리프가 없습니다.
                  </p>
                ) : null}
              </div>
            </div>
            <div
              aria-hidden
              className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br from-[hsl(var(--gov-blue))] to-transparent opacity-25 blur-3xl"
            />
          </div>
        </div>
      </section>

      {/* ---- Recent briefs ---- */}
      <Section
        title="최신 브리프"
        description="가장 최근에 발행된 공개 브리프입니다."
        actions={
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link href="/brief">
              전체 보기
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        }
      >
        {recent.length === 0 ? (
          <EmptyState
            title="아직 발행된 브리프가 없습니다"
            description="편집자가 작성하고 검토자가 승인하면 이곳에 공개됩니다."
          />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {recent.map((b) => (
              <li key={b.id}>
                <Link href={`/brief/issues/${encodeURIComponent(b.slug)}`} className="block">
                  <article className="card-float flex h-full flex-col gap-3 p-6">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" aria-hidden />
                        {b.categoryName ?? "브리프"}
                      </span>
                      <time>{formatKoreanDate(b.publishedAt)}</time>
                    </div>
                    <h3 className="text-[17px] font-semibold leading-snug tracking-tight">
                      {b.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {truncate(b.summary, 160)}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2 text-xs">
                      <span className="text-muted-foreground">
                        {relativeFromNow(b.publishedAt)}
                      </span>
                      <span className="text-primary font-medium">
                        자세히 보기 →
                      </span>
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ---- Categories ---- */}
      <Section
        title="주요 과방위 카테고리"
        description="관심 주제를 선택하면 관련 브리프만 필터링합니다."
      >
        <ul className="flex flex-wrap gap-2">
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
      </Section>

      {/* ---- Principles ---- */}
      <Section title="작성 원칙">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="card-line">
            <CardContent className="space-y-2 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                01 · 출처 우선
              </p>
              <h3 className="text-base font-semibold">공식 자료 기반</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                국회·정부 Open API 와 유관기관 보고서를 1순위 출처로 사용합니다.
              </p>
            </CardContent>
          </Card>
          <Card className="card-line">
            <CardContent className="space-y-2 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                02 · 검수 필수
              </p>
              <h3 className="text-base font-semibold">이중 확인 발행</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                편집자가 초안을 쓰고 검토자가 승인한 글만 공개됩니다. AI 자동 발행은 하지
                않습니다.
              </p>
            </CardContent>
          </Card>
          <Card className="card-line">
            <CardContent className="space-y-2 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                03 · 사실 중심
              </p>
              <h3 className="text-base font-semibold">정치적 수사 배제</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                자극적 제목·경쟁 후보 비교·지지 호소 카피를 사용하지 않습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>
    </div>
  );
}
