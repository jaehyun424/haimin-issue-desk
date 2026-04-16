/**
 * 의정활동 타임라인 seed (idempotent).
 *
 * - 멱등성: (occurredAt + title) 조합으로 존재 확인 후 없을 때만 insert.
 * - 본 파일의 데이터는 2026-04-16 시점에 확인된 **실제 활동 10건**이다.
 * - `officialSourceUrl` 중 일부는 **임시 URL**(언론 보도)로 설정되어 있으며, 추후 국회
 *   의안정보시스템(likms.assembly.go.kr) 직접 확인 뒤 수동으로 교체해야 한다.
 *   (봇 차단으로 자동 검증 불가 — 의원실 점검 필요.)
 *
 * 실행:
 *   npm run db:seed:activities
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { and, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { memberActivities } from "./schema";

type ActivityType =
  | "bill"
  | "vote"
  | "schedule"
  | "speech"
  | "office_action"
  | "press";

interface ActivitySeed {
  activityType: ActivityType;
  occurredAt: string; // ISO 8601
  title: string;
  summary: string;
  officialSourceUrl: string | null;
  /** 임시 URL 여부. true 인 항목은 공식 출처로 수동 교체 필요. */
  needsOfficialUrl?: boolean;
  metadata?: Record<string, unknown>;
}

const ACTIVITIES: ActivitySeed[] = [
  // ───────── 기존 2건 (신규 배포 대비 재수록) ─────────
  {
    activityType: "schedule",
    occurredAt: "2024-06-10T09:00:00+09:00",
    title: "22대 국회 과학기술정보방송통신위원회 위원 활동 시작",
    summary:
      "22대 국회 개원 직후 과학기술정보방송통신위원회 소속 위원으로 상임위 활동을 시작.",
    officialSourceUrl: "https://www.assembly.go.kr/members/22nd/LEEHAIMIN",
  },
  {
    activityType: "vote",
    occurredAt: "2024-12-26T14:00:00+09:00",
    title:
      "인공지능 발전과 신뢰 기반 조성 등에 관한 기본법(인공지능기본법) 국회 본회의 가결",
    summary:
      "인공지능 발전과 신뢰 기반 조성 등에 관한 기본법(인공지능기본법)이 국회 본회의를 통과함.",
    officialSourceUrl: "https://likms.assembly.go.kr/bill/MooringBill.do",
    needsOfficialUrl: true,
  },

  // ───────── 신규 8건 (Q2 리서치 → 재현 승인) ─────────
  {
    activityType: "bill",
    occurredAt: "2024-11-12T09:00:00+09:00",
    title: "'AI 신호등법'(인공지능산업 진흥·이용) 대표발의",
    summary:
      "고영향 AI 분류 체계와 영향받는 자 권리 개념을 도입하는 인공지능산업 진흥·이용 관련 법률안을 대표발의.",
    officialSourceUrl: "https://zdnet.co.kr/view/?no=20241112151352",
    needsOfficialUrl: true,
  },
  {
    activityType: "bill",
    occurredAt: "2025-01-20T09:00:00+09:00",
    title: "정보통신공사업법 개정안 대표발의",
    summary:
      "민간 발주자에 정보통신공사 대금지급 보증을 의무화하고 미이행 시 과태료를 부과하는 정보통신공사업법 개정안을 대표발의.",
    officialSourceUrl: "https://zdnet.co.kr/view/?no=20250120085403",
    needsOfficialUrl: true,
  },
  {
    activityType: "office_action",
    occurredAt: "2025-02-24T10:00:00+09:00",
    title: "AI 스타트업 현장 간담회 (뤼튼테크놀로지스)",
    summary:
      "AI 스타트업 뤼튼테크놀로지스를 방문해 20~30대 개발자·PM과 AI 경쟁력, 스타트업 생태계 현안에 관해 간담회를 진행.",
    officialSourceUrl: "https://www.etoday.co.kr/news/view/2559943",
    needsOfficialUrl: true,
  },
  {
    activityType: "bill",
    occurredAt: "2025-06-30T09:00:00+09:00",
    title: "정보보호 2법(정보통신망법·조세특례제한법) 동시 대표발의",
    summary:
      "정보보호 수준 평가 체계를 강화하는 정보통신망법 개정안과 보안 투자 세액공제를 확대하는 조세특례제한법 개정안을 동시에 대표발의.",
    officialSourceUrl: "https://zdnet.co.kr/view/?no=20250630154303",
    needsOfficialUrl: true,
  },
  {
    activityType: "speech",
    occurredAt: "2025-10-24T10:00:00+09:00",
    title: "ETRI 국정감사 출석 질의",
    summary:
      "한국전자통신연구원(ETRI) 등 과학기술 연구기관 국정감사에 출석해 기관 거버넌스 관련 사안을 점검.",
    officialSourceUrl:
      "https://www.atnnews.co.kr/news/articleView.html?idxno=106633",
    needsOfficialUrl: true,
  },
  {
    activityType: "speech",
    occurredAt: "2025-10-29T10:00:00+09:00",
    title: "과학기술정보통신부 국정감사 출석 질의",
    summary:
      "과기정통부 국정감사에 출석해 통신사 설비투자 현황과 5G 품질, 주파수 재할당 조건화 방안을 점검.",
    officialSourceUrl:
      "https://www.getnews.co.kr/news/articleView.html?idxno=851259",
    needsOfficialUrl: true,
  },
  {
    activityType: "bill",
    occurredAt: "2025-12-18T09:00:00+09:00",
    title: "정보통신망법(해킹 피해 입증책임 전환) 대표발의",
    summary:
      "해킹 피해에 대한 입증책임을 사업자로 전환하고 고의·중과실 시 최대 3배 징벌적 손해배상을 도입하는 정보통신망법 개정안을 대표발의.",
    officialSourceUrl:
      "https://www.edaily.co.kr/News/Read?newsId=04926566642399832&mediaCodeNo=257",
    needsOfficialUrl: true,
  },
  {
    activityType: "schedule",
    occurredAt: "2026-04-14T14:00:00+09:00",
    title: "AI 데이터센터 특별법 과방위 의결",
    summary:
      "AI 데이터센터(AIDC) 특별법 통합안이 과학기술정보방송통신위원회에서 의결됨. PPA(전력 직접계약) 특례와 세액공제 등을 포함.",
    officialSourceUrl: "https://zdnet.co.kr/view/?no=20260414172034",
    needsOfficialUrl: true,
  },
];

async function seedOne(spec: ActivitySeed): Promise<"inserted" | "existing"> {
  const occurredAt = new Date(spec.occurredAt);
  // 멱등 매칭 정책: "Asia/Seoul 기준 같은 날짜 + 같은 title" 이면 이미 존재로 간주.
  // timestamp 정확 일치(eq)로 보면 기존 prod 레코드가 seed 가 생성하는 Date 와 분·초
  // 단위로 어긋나 중복 삽입되는 사고가 발생(v1 초기에 확인). 사실관계 타임라인은
  // 분 단위 정밀도가 의미 없으므로 "한국 달력 기준 같은 날짜"면 동일 이벤트로 본다.
  const dayStr = spec.occurredAt.slice(0, 10); // "YYYY-MM-DD"
  const existing = await db
    .select({ id: memberActivities.id })
    .from(memberActivities)
    .where(
      and(
        sql`DATE(${memberActivities.occurredAt} AT TIME ZONE 'Asia/Seoul') = ${dayStr}::date`,
        eq(memberActivities.title, spec.title),
      ),
    )
    .limit(1);
  if (existing.length > 0) return "existing";

  const metadata: Record<string, unknown> = {
    seededAt: new Date().toISOString(),
    source: "seed-activities.ts",
    ...(spec.needsOfficialUrl
      ? { needsOfficialUrl: true, officialUrlNote: "likms.assembly.go.kr 확인 후 수동 교체 필요" }
      : {}),
    ...(spec.metadata ?? {}),
  };

  await db.insert(memberActivities).values({
    activityType: spec.activityType,
    occurredAt,
    title: spec.title,
    summary: spec.summary,
    officialSourceUrl: spec.officialSourceUrl,
    metadataJson: metadata,
  });
  return "inserted";
}

async function main() {
  let inserted = 0;
  let existing = 0;
  for (const spec of ACTIVITIES) {
    const r = await seedOne(spec);
    if (r === "inserted") {
      inserted += 1;
      console.log(`[activities] ✓ ${spec.occurredAt.slice(0, 10)} ${spec.title}`);
    } else {
      existing += 1;
      console.log(`[activities] — ${spec.occurredAt.slice(0, 10)} ${spec.title} (존재)`);
    }
  }
  console.log(
    `[activities] 완료: ${inserted}건 삽입, ${existing}건 존재. 총 ${ACTIVITIES.length}건 정의.`,
  );
  console.log(
    `[activities] ※ needsOfficialUrl=true 인 항목은 likms.assembly.go.kr 에서 의안번호·공식 URL 확인 후 수동 교체 필요.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("[activities] 실패", err);
  process.exit(1);
});
