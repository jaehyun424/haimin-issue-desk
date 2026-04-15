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
  TableEmpty,
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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">수집 문서</h1>
        <p className="text-sm text-muted-foreground">
          자동 파이프라인 및 수기 입력으로 수집된 출처 문서입니다. 이슈에 연결해 공개 브리프의 근거로 사용합니다.
        </p>
      </header>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 text-base font-semibold">수기 문서 추가</h2>
          <CreateSourceForm />
        </CardContent>
      </Card>

      <form action="/desk/sources" method="get" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="제목 검색"
          className="h-10 w-full max-w-xs rounded-md border border-input bg-background px-3"
          aria-label="제목 검색"
        />
        <Button type="submit" variant="outline">
          검색
        </Button>
      </form>

      <Section title={`${rows.length}건`}>
        <div className="card-line overflow-hidden">
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
              {rows.length === 0 ? (
                <TableEmpty>수집된 문서가 없습니다.</TableEmpty>
              ) : (
                rows.map((s) => (
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Section>
    </div>
  );
}
