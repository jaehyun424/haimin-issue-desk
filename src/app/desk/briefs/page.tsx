import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/common/section";
import { BriefStatusBadge } from "@/components/common/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { briefs, issues } from "@/lib/db/schema";
import { requireDeskSession } from "@/lib/auth/session";
import { formatKoreanDateTime } from "@/lib/utils";
import { BRIEF_STATUSES, BRIEF_STATUS_LABELS } from "@/lib/validation/brief";

export const metadata = { title: "브리프 관리" };

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function DeskBriefsPage({ searchParams }: Props) {
  await requireDeskSession();
  const params = await searchParams;

  const filter = (BRIEF_STATUSES as readonly string[]).includes(params.status ?? "")
    ? eq(briefs.status, params.status as (typeof BRIEF_STATUSES)[number])
    : sql`true`;

  const rows = await db
    .select({
      id: briefs.id,
      title: briefs.title,
      status: briefs.status,
      updatedAt: briefs.updatedAt,
      publishedAt: briefs.publishedAt,
      issueTitle: issues.title,
      issueId: issues.id,
    })
    .from(briefs)
    .innerJoin(issues, eq(issues.id, briefs.issueId))
    .where(filter)
    .orderBy(desc(briefs.updatedAt))
    .limit(100);

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-6">
        <p className="kicker">Briefs</p>
        <h1 className="mt-2">브리프 관리</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          초안 → 검토 → 발행 단계로 관리합니다. 발행은 reviewer 권한이 필요합니다.
        </p>
      </header>

      <form
        action="/desk/briefs"
        method="get"
        className="flex flex-col gap-2 sm:flex-row"
      >
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-auto"
          aria-label="상태 필터"
        >
          <option value="">전체</option>
          {BRIEF_STATUSES.map((s) => (
            <option key={s} value={s}>
              {BRIEF_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" className="w-full sm:w-auto">
          필터
        </Button>
      </form>

      <Section title={`${rows.length}건`}>
        <div className="card-line overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>이슈</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>갱신</TableHead>
                <TableHead>발행</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmpty>
                  아직 브리프가 없습니다. 이슈 상세 페이지에서 초안을 작성해 주세요.
                </TableEmpty>
              ) : (
                rows.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Link
                        href={`/desk/briefs/${b.id}`}
                        className="font-medium hover:underline"
                      >
                        {b.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <Link href={`/desk/issues/${b.issueId}`} className="hover:underline">
                        {b.issueTitle}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <BriefStatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatKoreanDateTime(b.updatedAt)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {b.publishedAt ? formatKoreanDateTime(b.publishedAt) : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Section>
    </div>
  );
}
