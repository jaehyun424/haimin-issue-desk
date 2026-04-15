import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { and, desc, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { FreshnessIndicator } from "@/components/common/freshness-indicator";
import { Section } from "@/components/common/section";
import { SourceList } from "@/components/common/source-list";
import { db } from "@/lib/db";
import {
  briefs,
  issueCategories,
  issueSourceLinks,
  issues,
  sourceDocuments,
} from "@/lib/db/schema";
import { formatKoreanDateTime } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeSlug(raw);
  const row = await db
    .select({ title: briefs.title, summary: briefs.summary })
    .from(briefs)
    .where(and(eq(briefs.slug, slug), eq(briefs.status, "published")))
    .limit(1);
  if (row.length === 0) return { title: "브리프" };
  return { title: row[0]!.title, description: row[0]!.summary };
}

export default async function BriefDetailPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeSlug(raw);
  const brief = await db
    .select({
      id: briefs.id,
      title: briefs.title,
      summary: briefs.summary,
      bodyMd: briefs.bodyMd,
      publishedAt: briefs.publishedAt,
      lastVerifiedAt: briefs.lastVerifiedAt,
      issueId: briefs.issueId,
      categoryName: issueCategories.name,
    })
    .from(briefs)
    .innerJoin(issues, eq(issues.id, briefs.issueId))
    .leftJoin(issueCategories, eq(issueCategories.id, issues.primaryCategoryId))
    .where(and(eq(briefs.slug, slug), eq(briefs.status, "published")))
    .limit(1)
    .then((rows) => rows[0]);

  if (!brief) notFound();

  const sources = await db
    .select({
      id: sourceDocuments.id,
      title: sourceDocuments.title,
      url: sourceDocuments.url,
      sourceName: sourceDocuments.sourceName,
      sourceType: sourceDocuments.sourceType,
      publishedAt: sourceDocuments.publishedAt,
      isPrimary: issueSourceLinks.isPrimary,
      relevance: issueSourceLinks.relevanceScore,
    })
    .from(issueSourceLinks)
    .innerJoin(sourceDocuments, eq(sourceDocuments.id, issueSourceLinks.sourceDocumentId))
    .where(eq(issueSourceLinks.issueId, brief.issueId))
    .orderBy(desc(issueSourceLinks.isPrimary), desc(issueSourceLinks.relevanceScore));

  const rendered = renderMarkdown(brief.bodyMd);

  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <nav className="text-sm">
        <Link
          href="/brief"
          className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          브리프 목록
        </Link>
      </nav>

      <header className="space-y-4 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {brief.categoryName ? (
            <Badge variant="outline" className="font-medium">
              {brief.categoryName}
            </Badge>
          ) : null}
          <FreshnessIndicator label="발행" value={brief.publishedAt} />
          {brief.lastVerifiedAt ? (
            <FreshnessIndicator
              label="마지막 검증"
              value={brief.lastVerifiedAt}
              variant="absolute"
            />
          ) : null}
          <span aria-hidden>·</span>
          <span>
            출처 <span className="font-semibold text-foreground">{sources.length}</span>건
          </span>
        </div>
        <h1 className="text-balance text-[2.25rem] font-semibold leading-[1.25] tracking-tight sm:text-4xl">
          {brief.title}
        </h1>
        <p className="text-[17px] leading-relaxed text-muted-foreground">
          {brief.summary}
        </p>
      </header>

      <div
        className="prose-brief"
        // 본문 Markdown → 허용된 제한 HTML. renderMarkdown 내부에서 sanitize.
        dangerouslySetInnerHTML={{ __html: rendered }}
      />

      <Section title="참고한 출처" description="공식·준공식 자료를 우선 배치했습니다.">
        <div className="card-line p-6">
          <SourceList items={sources} />
        </div>
      </Section>

      <footer className="rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
        본 브리프는 공식 자료를 기반으로 의원실이 정리한 것이며, 마지막 검증 시각 이후
        사실관계는 변동될 수 있습니다. 마지막 검증:{" "}
        <span className="font-medium text-foreground">
          {formatKoreanDateTime(brief.lastVerifiedAt ?? brief.publishedAt)}
        </span>
        . 오기·정정 요청은 의원실 공식 이메일로 받습니다.
      </footer>
    </article>
  );
}
