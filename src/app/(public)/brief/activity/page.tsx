import { desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { db } from "@/lib/db";
import { memberActivities } from "@/lib/db/schema";
import { MEMBER } from "@/lib/constants/member";
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

  return (
    <div className="space-y-8">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="kicker">의정활동</p>
        <h1>의정활동 타임라인</h1>
        <p className="max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
          {MEMBER.name} 의원({MEMBER.party} · {MEMBER.district} · {MEMBER.committeeShort})의
          발의안·표결·회의·발언 등 공식 활동과 의원실 후속조치를 시간순으로 표시합니다.
          사실 기록 중심으로 정리하며, 정치적 수사는 배제합니다.
        </p>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          title="공식 활동 데이터를 정리 중입니다"
          description="국회 공식 자료와 의원실이 직접 정리한 기록이 반영되면 이 페이지에 시간순으로 표시됩니다."
        />
      ) : (
        <section>
          <p className="mb-5 text-sm text-muted-foreground">
            총 <span className="font-semibold text-foreground">{rows.length}</span>건
          </p>
          <ol className="border-l border-border">
            {rows.map((a) => (
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
      )}
    </div>
  );
}
