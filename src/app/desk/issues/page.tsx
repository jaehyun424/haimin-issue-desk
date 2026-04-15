import Link from "next/link";
import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Section } from "@/components/common/section";
import {
  IssuePriorityBadge,
  IssueStatusBadge,
} from "@/components/common/status-badge";
import { db } from "@/lib/db";
import { issueCategories, issues, users } from "@/lib/db/schema";
import { requireDeskSession } from "@/lib/auth/session";
import { formatKoreanDateTime } from "@/lib/utils";
import {
  ISSUE_STATUSES,
  ISSUE_STATUS_LABELS,
} from "@/lib/validation/issue";

export const metadata = { title: "이슈 관리" };

interface Props {
  searchParams: Promise<{ status?: string; q?: string; category?: string }>;
}

export default async function DeskIssuesPage({ searchParams }: Props) {
  await requireDeskSession();
  const params = await searchParams;

  const validStatuses = (ISSUE_STATUSES as readonly string[]).includes(params.status ?? "")
    ? [params.status as (typeof ISSUE_STATUSES)[number]]
    : null;

  const rows = await db
    .select({
      id: issues.id,
      title: issues.title,
      status: issues.status,
      priority: issues.priority,
      updatedAt: issues.updatedAt,
      categoryName: issueCategories.name,
      ownerName: users.name,
    })
    .from(issues)
    .leftJoin(issueCategories, eq(issueCategories.id, issues.primaryCategoryId))
    .leftJoin(users, eq(users.id, issues.ownerUserId))
    .where(
      and(
        params.q ? ilike(issues.title, `%${params.q}%`) : sql`true`,
        validStatuses ? inArray(issues.status, validStatuses) : sql`true`,
        params.category ? eq(issueCategories.name, params.category) : sql`true`,
      ),
    )
    .orderBy(desc(issues.updatedAt))
    .limit(100);

  const categories = await db
    .select({ id: issueCategories.id, name: issueCategories.name })
    .from(issueCategories)
    .where(eq(issueCategories.isActive, true))
    .orderBy(issueCategories.sortOrder);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">이슈 관리</p>
          <h1 className="mt-2">이슈 관리</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            과방위 현안을 이슈 단위로 추적합니다.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/desk/issues/new">새 이슈</Link>
        </Button>
      </header>

      <form
        action="/desk/issues"
        method="get"
        className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]"
      >
        <input
          type="text"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="제목 검색"
          className="h-10 w-full rounded-md border border-input bg-background px-3"
          aria-label="제목 검색"
        />
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-auto"
          aria-label="상태 필터"
        >
          <option value="">전체 상태</option>
          {ISSUE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ISSUE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={params.category ?? ""}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-auto"
          aria-label="카테고리 필터"
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" className="w-full sm:w-auto">
          필터
        </Button>
      </form>

      <Section title={`${rows.length}건`}>
        {rows.length === 0 ? (
          <div className="card-line p-10 text-center text-sm text-muted-foreground">
            조건에 맞는 이슈가 없습니다.
          </div>
        ) : (
          <>
            {/* 데스크톱: 테이블 */}
            <div className="card-line hidden overflow-hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>우선순위</TableHead>
                    <TableHead>담당</TableHead>
                    <TableHead>갱신</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>
                        <Link
                          className="font-medium hover:underline"
                          href={`/desk/issues/${i.id}`}
                        >
                          {i.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {i.categoryName ?? "-"}
                      </TableCell>
                      <TableCell>
                        <IssueStatusBadge status={i.status} />
                      </TableCell>
                      <TableCell>
                        <IssuePriorityBadge priority={i.priority} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {i.ownerName ?? "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatKoreanDateTime(i.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 모바일: 카드 리스트 */}
            <ul className="space-y-3 md:hidden">
              {rows.map((i) => (
                <li key={i.id}>
                  <Link
                    href={`/desk/issues/${i.id}`}
                    className="card-flat block space-y-2 p-4"
                  >
                    <p className="text-[15px] font-medium leading-snug text-foreground">
                      {i.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <IssueStatusBadge status={i.status} />
                      <IssuePriorityBadge priority={i.priority} />
                      {i.categoryName ? (
                        <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                          {i.categoryName}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>담당 {i.ownerName ?? "-"}</span>
                      <span>{formatKoreanDateTime(i.updatedAt)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>
    </div>
  );
}
