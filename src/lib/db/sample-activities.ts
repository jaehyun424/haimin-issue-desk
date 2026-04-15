/**
 * 의정활동 타임라인 fallback 용 샘플.
 *
 * DB 에 member_activities 레코드가 0건일 때만 이 배열이 사용된다.
 * API 키가 설정되고 cron 이 DB 를 채우기 시작하면 자동으로 fallback 은 가려진다.
 */
export interface SampleActivity {
  id: string;
  activityType: "bill" | "vote" | "schedule" | "speech" | "office_action" | "press";
  occurredAt: string; // ISO
  title: string;
  summary: string | null;
  officialSourceUrl: string | null;
}

export const FALLBACK_ACTIVITIES: SampleActivity[] = [
  {
    id: "sample-1",
    activityType: "bill",
    occurredAt: "2026-04-10T09:00:00+09:00",
    title: "[예시] AI 기본법 하위법령 제정 촉구 결의안 준비",
    summary: "고영향 AI 영향평가 고시 제정 일정·절차를 정비하도록 촉구하는 결의안 초안.",
    officialSourceUrl: null,
  },
  {
    id: "sample-2",
    activityType: "speech",
    occurredAt: "2026-04-05T10:30:00+09:00",
    title: "[예시] 과방위 전체회의 — AIDC 특별법 심사 논의 발언",
    summary: "AIDC 입지·전력·PPA 쟁점과 계통 접속 병목 완화 방안 질의.",
    officialSourceUrl: null,
  },
  {
    id: "sample-3",
    activityType: "office_action",
    occurredAt: "2026-04-01T14:00:00+09:00",
    title: "[예시] SKT 침해사고 대응 현장점검",
    summary: "정보보호 투자 인센티브 재설계를 위한 이동통신사 현장 점검.",
    officialSourceUrl: null,
  },
  {
    id: "sample-4",
    activityType: "press",
    occurredAt: "2026-03-25T09:00:00+09:00",
    title: "[예시] 정보보호 세액공제 실효성 점검 보도자료",
    summary: "중소기업의 정보보호 투자 확대를 유도하기 위한 세액공제 제도 재설계 방향.",
    officialSourceUrl: null,
  },
  {
    id: "sample-5",
    activityType: "schedule",
    occurredAt: "2026-03-20T13:00:00+09:00",
    title: "[예시] 제1소위 AI기본법 하위법령 심사 일정",
    summary: null,
    officialSourceUrl: null,
  },
];
