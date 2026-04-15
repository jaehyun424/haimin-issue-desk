import { desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { memberActivities } from "@/lib/db/schema";
import { FALLBACK_ACTIVITIES } from "@/lib/db/sample-activities";
import { formatKoreanDate } from "@/lib/utils";

export const metadata = { title: "의정활동 타임라인" };
export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  bill: "발의안",
  vote: "표결",
  schedule: "위원회 일정",
  speech: "발언",
  office_action: "의원실 후속조치",
  press: "보도자료",
};

export default async function ActivityTimelinePage() {
  const rows = await db
    .select()
    .from(memberActivities)
    .orderBy(desc(memberActivities.occurredAt))
    .limit(200);

  const isFallback = rows.length === 0;
  const items = isFallback
    ? FALLBACK_ACTIVITIES.map((a) => ({
        id: a.id,
        activityType: a.activityType,
        occurredAt: a.occurredAt,
        title: a.title,
        summary: a.summary,
        officialSourceUrl: a.officialSourceUrl,
      }))
    : rows.map((a) => ({
        id: a.id,
        activityType: a.activityType,
        occurredAt: a.occurredAt.toISOString(),
        title: a.title,
        summary: a.summary,
        officialSourceUrl: a.officialSourceUrl,
      }));

  return (
    <div className="space-y-8">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="kicker">Activity</p>
        <h1>의정활동 타임라인</h1>
        <p className="max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
          이해민 의원의 발의안·표결·회의·발언 등 공식 활동과 의원실 후속조치를 시간순으로
          표시합니다. 사실 기록 중심으로 정리하며, 정치적 수사는 배제합니다.
        </p>
      </header>

      {isFallback ? (
        <div className="rounded border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">예시 데이터입니다.</strong> 국회 Open API 연동
          (<code className="font-mono text-xs">ASSEMBLY_API_KEY</code> + 의원{" "}
          <code className="font-mono text-xs">MONA_CD</code>) 과 수기 입력이 반영되면 이 페이지는
          실제 기록으로 자동 전환됩니다.
        </div>
      ) : null}

      <section>
        <p className="mb-5 text-sm text-muted-foreground">
          총 <span className="font-semibold text-foreground">{items.length}</span>건
        </p>
        <ol className="border-l border-border">
          {items.map((a) => (
            <li key={a.id} className="relative pl-6 pb-7 last:pb-0">
              <span
                aria-hidden
                className="absolute -left-[5px] top-1.5 h-[9px] w-[9px] rounded-full border-2 border-primary bg-background"
              />
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="font-medium">
                  {TYPE_LABELS[a.activityType] ?? a.activityType}
                </Badge>
                <time>{formatKoreanDate(a.occurredAt)}</time>
              </div>
              <h3 className="mt-1.5 text-[17px] font-semibold leading-snug text-foreground">
                {a.officialSourceUrl ? (
                  <a
                    href={a.officialSourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline decoration-border underline-offset-4 hover:decoration-foreground"
                  >
                    {a.title}
                  </a>
                ) : (
                  a.title
                )}
              </h3>
              {a.summary ? (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {a.summary}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
