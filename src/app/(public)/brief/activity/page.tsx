import { desc, sql } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import { db } from "@/lib/db";
import { memberActivities } from "@/lib/db/schema";
import { formatKoreanDate, relativeFromNow } from "@/lib/utils";

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

const TYPE_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "success" | "warning"
> = {
  bill: "default",
  vote: "warning",
  schedule: "outline",
  speech: "secondary",
  office_action: "success",
  press: "outline",
};

export default async function ActivityTimelinePage() {
  const items = await db
    .select()
    .from(memberActivities)
    .orderBy(desc(memberActivities.occurredAt))
    .limit(200);
  void sql;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">의정활동 타임라인</h1>
        <p className="max-w-2xl text-muted-foreground">
          이해민 의원의 발의안·표결·회의·발언 등 공식 활동과 의원실 후속조치를 시간순으로
          표시합니다. 사실 기록 중심으로 정리하며, 정치적 수사는 배제합니다.
        </p>
      </header>
      <Section title={`${items.length}건`}>
        {items.length === 0 ? (
          <EmptyState
            title="표시할 활동 기록이 없습니다"
            description="국회 Open API 와 의원실 수동 입력이 동기화된 뒤 이곳에 표시됩니다."
          />
        ) : (
          <ol className="relative space-y-6 border-l border-border pl-6">
            {items.map((a) => (
              <li key={a.id} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[29px] mt-1 h-3 w-3 rounded-full bg-primary"
                />
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant={TYPE_VARIANTS[a.activityType] ?? "outline"}>
                    {TYPE_LABELS[a.activityType] ?? a.activityType}
                  </Badge>
                  <span>{formatKoreanDate(a.occurredAt)}</span>
                  <span aria-hidden>·</span>
                  <span>{relativeFromNow(a.occurredAt)}</span>
                </div>
                <h3 className="mt-1 text-lg font-semibold leading-snug">
                  {a.officialSourceUrl ? (
                    <a
                      href={a.officialSourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="hover:underline"
                    >
                      {a.title}
                    </a>
                  ) : (
                    a.title
                  )}
                </h3>
                {a.summary ? (
                  <p className="mt-1 text-sm text-muted-foreground">{a.summary}</p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </Section>
    </div>
  );
}
