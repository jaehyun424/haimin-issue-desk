import { desc, eq, sql } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/common/section";
import { EmptyState } from "@/components/common/empty-state";
import { FreshnessIndicator } from "@/components/common/freshness-indicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { issueCategories, voiceSubmissions } from "@/lib/db/schema";
import { FLAG, getFlag } from "@/lib/feature-flags";
import { requireCapability } from "@/lib/auth/session";
import {
  VOICE_STATUS_LABELS,
  VOICE_STATUSES,
  VOICE_TYPE_LABELS,
} from "@/lib/validation/voice";
import { VoiceStatusForm } from "./status-form";

export const metadata = { title: "의견 접수 Triage" };

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function DeskVoicePage({ searchParams }: Props) {
  await requireCapability("voice.triage");
  const enabled = await getFlag(FLAG.VOICE_ENABLED);
  const params = await searchParams;

  const filter = (VOICE_STATUSES as readonly string[]).includes(params.status ?? "")
    ? eq(voiceSubmissions.status, params.status as (typeof VOICE_STATUSES)[number])
    : sql`true`;

  const rows = await db
    .select({
      id: voiceSubmissions.id,
      type: voiceSubmissions.type,
      title: voiceSubmissions.title,
      status: voiceSubmissions.status,
      displayName: voiceSubmissions.displayName,
      email: voiceSubmissions.email,
      consentOptionalContact: voiceSubmissions.consentOptionalContact,
      createdAt: voiceSubmissions.createdAt,
      categoryName: issueCategories.name,
    })
    .from(voiceSubmissions)
    .leftJoin(issueCategories, eq(issueCategories.id, voiceSubmissions.categoryId))
    .where(filter)
    .orderBy(desc(voiceSubmissions.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">의견 접수 Triage</h1>
          <p className="text-sm text-muted-foreground">
            시민 의견을 분류하고 이슈와 연결합니다. 외부 공개는 금지됩니다.
          </p>
        </div>
        <Badge variant={enabled ? "success" : "outline"}>
          공개 상태: {enabled ? "ON" : "OFF"}
        </Badge>
      </header>

      {!enabled ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            voice 모듈이 현재 OFF 입니다. 접수 창구는 노출되지 않으며, 기존 데이터는 여기서만
            조회됩니다.
          </CardContent>
        </Card>
      ) : null}

      <form action="/desk/voice" method="get" className="flex gap-2">
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="상태 필터"
        >
          <option value="">전체</option>
          {VOICE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {VOICE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          필터
        </Button>
      </form>

      <Section title={`${rows.length}건`}>
        {rows.length === 0 ? (
          <EmptyState title="조건에 맞는 제출이 없습니다" />
        ) : (
          <div className="card-line overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>분야</TableHead>
                  <TableHead>접수</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>연락 동의</TableHead>
                  <TableHead>조치</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <details>
                        <summary className="cursor-pointer font-medium">{r.title}</summary>
                        <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                          제출자: {r.displayName ?? "익명"}
                          {r.email ? ` (${r.email})` : ""}
                        </p>
                      </details>
                    </TableCell>
                    <TableCell className="text-xs">{VOICE_TYPE_LABELS[r.type]}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.categoryName ?? "-"}
                    </TableCell>
                    <TableCell>
                      <FreshnessIndicator label="" value={r.createdAt} variant="both" />
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{VOICE_STATUS_LABELS[r.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.consentOptionalContact ? "동의" : "-"}
                    </TableCell>
                    <TableCell>
                      <VoiceStatusForm id={r.id} currentStatus={r.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>
    </div>
  );
}
