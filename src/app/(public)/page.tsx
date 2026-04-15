import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { desc, eq, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { db } from "@/lib/db";
import {
  briefs,
  issueCategories,
  issueSourceLinks,
  issues,
} from "@/lib/db/schema";
import { formatKoreanDate, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SHORT_CATEGORY: Record<string, string> = {
  "AI·데이터·고영향 AI": "AI·데이터",
  "데이터센터·AIDC·전력·PPA": "AIDC·전력",
  "사이버보안·침해사고·정보보호": "사이버보안",
  "통신·이동통신·망 이용": "통신",
  "방송·미디어·플랫폼 규제": "방송·미디어",
  "OTT·콘텐츠·저작권": "OTT·콘텐츠",
  "반도체·국가전략기술": "반도체",
  "우주·과학기술·연구인프라": "우주·과학",
  "R&D 예산·거버넌스": "R&D",
  "개인정보·디지털권리·딥페이크": "개인정보",
  "규제기관·법안소위·과방위 운영": "과방위 운영",
};

function shortenCategory(name: string | null | undefined): string {
  if (!name) return "";
  return SHORT_CATEGORY[name] ?? (name.length > 10 ? `${name.slice(0, 10)}…` : name);
}

export default async function HomePage() {
  const [recent, categories] = await Promise.all([
    db
      .select({
        id: briefs.id,
        slug: briefs.slug,
        title: briefs.title,
        summary: briefs.summary,
        publishedAt: briefs.publishedAt,
        lastVerifiedAt: briefs.lastVerifiedAt,
        issueId: briefs.issueId,
        categoryName: issueCategories.name,
        sourceCount: sql<number>`(
          SELECT count(*)::int FROM ${issueSourceLinks}
          WHERE ${issueSourceLinks.issueId} = ${briefs.issueId}
        )`,
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
      {/* Hero */}
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

      {/* 최근 브리프 */}
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
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {recent.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/brief/issues/${encodeURIComponent(b.slug)}`}
                  className="group card-flat flex h-full flex-col gap-3 p-5"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <time className="tabular-nums">
                      {formatKoreanDate(b.publishedAt)}
                    </time>
                    {b.categoryName ? (
                      <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 font-medium text-foreground">
                        {shortenCategory(b.categoryName)}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-[1.0625rem] font-semibold leading-snug text-foreground group-hover:underline group-hover:underline-offset-4">
                    {b.title}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {truncate(b.summary, 160)}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
                    <span>
                      출처 <span className="font-semibold text-foreground">{b.sourceCount ?? 0}</span>건
                    </span>
                    {b.lastVerifiedAt ? (
                      <span className="tabular-nums">
                        검증 {formatKoreanDate(b.lastVerifiedAt)}
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 카테고리 */}
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

      {/* 편집 원칙 */}
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
