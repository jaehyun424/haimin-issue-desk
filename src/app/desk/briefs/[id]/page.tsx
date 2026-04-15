import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/common/section";
import { BriefStatusBadge } from "@/components/common/status-badge";
import { db } from "@/lib/db";
import { briefs, issueSourceLinks, issues } from "@/lib/db/schema";
import { requireCapability } from "@/lib/auth/session";
import { formatKoreanDateTime } from "@/lib/utils";
import { BriefForm } from "../brief-form";
import { BriefTransitionPanel } from "./transition-panel";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BriefDetailPage({ params }: Props) {
  const session = await requireCapability("brief.draft");
  const { id } = await params;

  const brief = await db
    .select({
      id: briefs.id,
      issueId: briefs.issueId,
      title: briefs.title,
      summary: briefs.summary,
      bodyMd: briefs.bodyMd,
      status: briefs.status,
      slug: briefs.slug,
      publishedAt: briefs.publishedAt,
      lastVerifiedAt: briefs.lastVerifiedAt,
      updatedAt: briefs.updatedAt,
      issueTitle: issues.title,
    })
    .from(briefs)
    .innerJoin(issues, eq(issues.id, briefs.issueId))
    .where(eq(briefs.id, id))
    .limit(1)
    .then((r) => r[0]);
  if (!brief) notFound();

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(issueSourceLinks)
    .where(eq(issueSourceLinks.issueId, brief.issueId));
  const count = countRow?.count ?? 0;

  return (
    <div className="space-y-8">
      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-xs text-muted-foreground">
          이슈:{" "}
          <Link className="hover:underline" href={`/desk/issues/${brief.issueId}`}>
            {brief.issueTitle}
          </Link>
          <span className="mx-1">·</span>
          <span className="font-mono">{brief.slug}</span>
        </p>
        <h1 className="text-[1.75rem] leading-[1.25] sm:text-[2rem]">{brief.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <BriefStatusBadge status={brief.status} />
          <span>갱신: {formatKoreanDateTime(brief.updatedAt)}</span>
          {brief.publishedAt ? (
            <span>발행: {formatKoreanDateTime(brief.publishedAt)}</span>
          ) : null}
        </div>
        {brief.status === "published" ? (
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href={`/brief/issues/${brief.slug}`} target="_blank">
              공개 페이지 보기
            </Link>
          </Button>
        ) : null}
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">본문 편집</CardTitle>
            </CardHeader>
            <CardContent>
              <BriefForm
                mode="edit"
                issueId={brief.issueId}
                initial={{
                  id: brief.id,
                  title: brief.title,
                  summary: brief.summary,
                  bodyMd: brief.bodyMd,
                }}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">상태 전환</CardTitle>
          </CardHeader>
          <CardContent>
            <BriefTransitionPanel
              id={brief.id}
              currentStatus={brief.status}
              sourceCount={count ?? 0}
              role={session.user.role}
            />
          </CardContent>
        </Card>
      </section>

      <Section title="체크리스트">
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>· 사실형 제목인지 (자극적 수사 ❌)</li>
          <li>· 요약 3줄 이내로 이슈 핵심 설명</li>
          <li>
            · 본문 4섹션 구조: 이슈 개요 → 현재 상황 → 의원실 관련 활동 → 관련 법안·회의
          </li>
          <li>· 연결 출처 최소 1건 이상 ({count ?? 0}건 연결됨)</li>
          <li>· 발행 전 검토자 확인 (발행 안전모드 켜짐 시 필수)</li>
        </ul>
      </Section>
    </div>
  );
}
