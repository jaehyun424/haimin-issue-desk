import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { ElectionBanner } from "@/components/common/election-banner";
import { Section } from "@/components/common/section";
import { FreshnessIndicator } from "@/components/common/freshness-indicator";
import { db } from "@/lib/db";
import { briefs, issueCategories } from "@/lib/db/schema";
import { FLAG, getFlags } from "@/lib/feature-flags";
import { formatKoreanDate, truncate } from "@/lib/utils";

export const revalidate = 300; // 5분

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
      })
      .from(briefs)
      .where(eq(briefs.status, "published"))
      .orderBy(desc(briefs.publishedAt))
      .limit(5),
    db
      .select({ id: issueCategories.id, name: issueCategories.name })
      .from(issueCategories)
      .where(eq(issueCategories.isActive, true))
      .orderBy(issueCategories.sortOrder),
  ]);
  void and; // 미사용 import 방지용

  return (
    <div className="space-y-12">
      <ElectionBanner enabled={flags[FLAG.ELECTION_MODE]} />
      <section className="space-y-4">
        <p className="text-sm font-medium text-primary">이해민 의원실</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          과방위 의정 브리프
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          국회 과학기술정보방송통신위원회 관련 현안을 의원실 관점에서 정리한 공개 브리프입니다.
          공식 출처를 기반으로 작성하며, 모든 글은 편집자와 검토자가 확인한 뒤 발행됩니다.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="lg">
            <Link href="/brief">최근 브리프 보기</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/brief/activity">의정활동 타임라인</Link>
          </Button>
        </div>
      </section>

      <Section
        title="최근 브리프"
        description="발행된 순서로 최신 5건을 표시합니다."
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/brief">전체 보기 →</Link>
          </Button>
        }
      >
        {recent.length === 0 ? (
          <EmptyState
            title="아직 발행된 브리프가 없습니다"
            description="편집자가 작성하고 검토자가 승인하면 이곳에 공개됩니다."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {recent.map((b) => (
              <li key={b.id}>
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatKoreanDate(b.publishedAt)}</span>
                      <FreshnessIndicator
                        label="발행"
                        value={b.publishedAt}
                        variant="relative"
                      />
                    </div>
                    <h3 className="text-lg font-semibold leading-snug">
                      <Link href={`/brief/issues/${b.slug}`} className="hover:underline">
                        {b.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {truncate(b.summary, 160)}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="주요 과방위 카테고리">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/brief?category=${encodeURIComponent(c.name)}`}
                className="block rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="데이터와 출처">
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <Card className="card-line">
            <CardContent className="p-4">
              <p className="font-medium text-foreground">공식·준공식 자동 수집</p>
              <p>국회 Open API · 과기정통부 · 정책브리핑 · KISA · 열린국회정보</p>
            </CardContent>
          </Card>
          <Card className="card-line">
            <CardContent className="p-4">
              <p className="font-medium text-foreground">편집 원칙</p>
              <p>사실 중심 · 출처 필수 · 자극적 수사 금지 · 소급 검증 기록</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-xs text-muted-foreground">
          자세한 정책은{" "}
          <Link className="underline" href="/source-policy">
            출처·갱신 정책
          </Link>{" "}
          페이지를 확인해 주세요.
        </p>
      </Section>
    </div>
  );
}
