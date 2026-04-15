import Link from "next/link";
import { Search, X } from "lucide-react";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { db } from "@/lib/db";
import {
  briefs,
  issueCategories,
  issueSourceLinks,
  issues,
} from "@/lib/db/schema";
import { formatKoreanDate, truncate } from "@/lib/utils";

export const metadata = { title: "브리프 목록" };
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

  const activeFilters = [
    params.q ? { label: `"${params.q}"`, key: "q" } : null,
    params.category ? { label: params.category, key: "category" } : null,
  ].filter(Boolean) as { label: string; key: string }[];

  return (
    <div className="space-y-10">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="kicker">브리프</p>
        <h1>과방위 현안 브리프</h1>
        <p className="max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
          이해민 의원실이 작성·검토한 공개 브리프입니다. 제목 또는 카테고리로 필터링할
          수 있고, 각 글에는 공식 출처와 마지막 검증 시각이 함께 표기됩니다.
        </p>
      </header>

      <form
        action="/brief"
        method="get"
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <label htmlFor="search" className="sr-only">
          제목 검색
        </label>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="search"
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="제목 검색"
            className="pl-9"
          />
        </div>
        <select
          name="category"
          defaultValue={params.category ?? ""}
          className="h-10 rounded border border-input bg-background px-3 text-sm"
          aria-label="카테고리 선택"
        >
          <option value="">전체 카테고리</option>
          {allCategories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit">검색</Button>
      </form>

      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>적용된 필터:</span>
          {activeFilters.map((f) => (
            <Link
              key={f.key}
              href={{
                pathname: "/brief",
                query: Object.fromEntries(
                  Object.entries(params).filter(([k]) => k !== f.key),
                ),
              }}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-3 py-1 font-medium text-foreground hover:bg-muted"
            >
              {f.label}
              <X className="h-3 w-3" aria-hidden />
            </Link>
          ))}
          <Link href="/brief" className="text-primary underline-offset-4 hover:underline">
            전체 해제
          </Link>
        </div>
      ) : null}

      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          총 <span className="font-semibold text-foreground">{rows.length}</span>건
        </p>
        {rows.length === 0 ? (
          <EmptyState
            title="조건에 맞는 브리프가 없습니다"
            description="검색어나 카테고리를 바꿔 보시거나, 전체 목록에서 탐색해 주세요."
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {rows.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/brief/issues/${encodeURIComponent(b.slug)}`}
                  className="group card-flat flex h-full flex-col p-5"
                >
                  {/* 상단 메타 */}
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

                  {/* 제목 — 가장 눈에 띄게 */}
                  <h3 className="mt-3 text-[1.25rem] font-semibold leading-[1.35] tracking-tight text-foreground group-hover:underline group-hover:underline-offset-4">
                    {b.title}
                  </h3>

                  {/* 요약 2~3줄 */}
                  <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">
                    {truncate(b.summary, 240)}
                  </p>

                  {/* 하단 메타 */}
                  <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
                    <span>
                      출처{" "}
                      <span className="font-semibold text-foreground">
                        {b.sourceCount ?? 0}
                      </span>
                      건
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
      </div>
    </div>
  );
}
