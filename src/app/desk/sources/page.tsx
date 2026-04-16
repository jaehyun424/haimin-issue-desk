import { desc, ilike, sql } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/common/section";
import { FreshnessIndicator } from "@/components/common/freshness-indicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { sourceDocuments } from "@/lib/db/schema";
import { requireDeskSession } from "@/lib/auth/session";
import { SOURCE_TYPE_LABELS } from "@/lib/validation/source";
import { formatKoreanDate } from "@/lib/utils";
import { CreateSourceForm } from "./create-source-form";

export const metadata = { title: "수집 문서" };

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function DeskSourcesPage({ searchParams }: Props) {
  await requireDeskSession();
  const params = await searchParams;

  const rows = await db
    .select()
    .from(sourceDocuments)
    .where(params.q ? ilike(sourceDocuments.title, `%${params.q}%`) : sql`true`)
    .orderBy(desc(sourceDocuments.fetchedAt))
    .limit(100);

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-6">
        <p className="kicker">수집 문서</p>
        <h1 className="mt-2">수집 문서</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          자동 수집 및 직접 등록으로 모은 출처 문서입니다. 이슈에 연결해 공개 브리프의
          근거로 사용합니다.
        </p>
      </header>

      <section>
        <header className="border-b border-foreground/80 pb-2">
          <h2>직접 등록</h2>
        </header>
        <Card className="mt-5">
          <CardContent className="p-5 sm:p-6">
            <CreateSourceForm />
          </CardContent>
        </Card>
      </section>

      <form
        action="/desk/sources"
        method="get"
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="text"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="제목 검색"
          className="h-10 w-full rounded-md border border-input bg-background px-3 sm:max-w-xs"
          aria-label="제목 검색"
        />
        <Button type="submit" variant="outline" className="w-full sm:w-auto">
          검색
        </Button>
      </form>

      <Section title={`${rows.length}건`}>
        {rows.length === 0 ? (
          <div className="card-line p-10 text-center text-sm text-muted-foreground">
            수집된 문서가 없습니다.
          </div>
        ) : (
          <>
            {/* 데스크톱: 테이블 */}
            <div className="card-line hidden overflow-hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>출처</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>발행</TableHead>
                    <TableHead>수집</TableHead>
                    <TableHead>ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        {s.url ? (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="hover:underline"
                          >
                            {s.title}
                          </a>
                        ) : (
                          s.title
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.sourceName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{SOURCE_TYPE_LABELS[s.sourceType]}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {s.publishedAt ? formatKoreanDate(s.publishedAt) : "-"}
                      </TableCell>
                      <TableCell>
                        <FreshnessIndicator label="" value={s.fetchedAt} variant="relative" />
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {s.id.slice(0, 8)}…
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 모바일: 카드 */}
            <ul className="space-y-3 md:hidden">
              {rows.map((s) => (
                <li key={s.id} className="card-line space-y-2 p-4">
                  <p className="text-[15px] font-medium leading-snug text-foreground">
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hover:underline"
                      >
                        {s.title}
                      </a>
                    ) : (
                      s.title
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">{SOURCE_TYPE_LABELS[s.sourceType]}</Badge>
                    <span className="text-xs text-muted-foreground">{s.sourceName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>발행 {s.publishedAt ? formatKoreanDate(s.publishedAt) : "-"}</span>
                    <FreshnessIndicator label="수집" value={s.fetchedAt} variant="relative" />
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    ID: {s.id.slice(0, 8)}…
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>
    </div>
  );
}
