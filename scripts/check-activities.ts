/**
 * prod DB `member_activities` 정합성 확인 (read-only).
 *
 * 목적:
 *   `npm run db:seed:activities` 실행 전에, seed-activities.ts 의 정의와 prod 실데이터가
 *   일치하는지 대조한다. 멱등 seed 의 매칭 기준(occurred_at + title)에 정확히
 *   맞춰야 기존 레코드를 중복 삽입하지 않는다.
 *
 * 실행:
 *   DATABASE_URL="postgres://…" npm run db:check:activities
 *   또는
 *   DATABASE_URL="postgres://…" npx tsx scripts/check-activities.ts
 *
 * Exit code:
 *   0 — 정합성 OK (push 안전, seed 실행 시 신규만 삽입됨)
 *   1 — 불일치 있음 (seed-activities.ts 수정 또는 prod DB 교정 필요)
 *
 * 이 스크립트는 SELECT 만 수행하며 DB 상태를 변경하지 않는다.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { memberActivities } from "@/lib/db/schema";

/**
 * seed-activities.ts 의 ACTIVITIES 에서 매칭 핵심 필드(date + title)만 복사.
 * seed 파일을 수정하면 이 리스트도 함께 업데이트할 것.
 */
const SEED_ENTRIES: Array<{ date: string; title: string }> = [
  { date: "2024-06-10", title: "22대 국회 과학기술정보방송통신위원회 위원 활동 시작" },
  { date: "2024-11-12", title: "'AI 신호등법'(인공지능산업 진흥·이용) 대표발의" },
  {
    date: "2024-12-26",
    title:
      "인공지능 발전과 신뢰 기반 조성 등에 관한 기본법(인공지능기본법) 국회 본회의 가결",
  },
  { date: "2025-01-20", title: "정보통신공사업법 개정안 대표발의" },
  { date: "2025-02-24", title: "AI 스타트업 현장 간담회 (뤼튼테크놀로지스)" },
  { date: "2025-06-30", title: "정보보호 2법(정보통신망법·조세특례제한법) 동시 대표발의" },
  { date: "2025-10-24", title: "ETRI 국정감사 출석 질의" },
  { date: "2025-10-29", title: "과학기술정보통신부 국정감사 출석 질의" },
  { date: "2025-12-18", title: "정보통신망법(해킹 피해 입증책임 전환) 대표발의" },
  { date: "2026-04-14", title: "AI 데이터센터 특별법 과방위 의결" },
];

/**
 * Asia/Seoul 기준 날짜 (YYYY-MM-DD).
 *
 * seed-activities.ts 의 멱등 매칭이 Postgres `AT TIME ZONE 'Asia/Seoul'` DATE 비교를
 * 사용하므로, check 스크립트도 동일 기준으로 날짜를 추출해야 예측이 일치한다.
 * 과거 버전은 JS `toISOString()` (UTC 기준)을 썼는데, prod 레코드가 KST 자정 근처에
 * 저장된 경우 UTC 날짜가 한 날 앞/뒤로 밀려 seed 의 실제 동작과 check 예측이
 * 어긋나는 사고가 있었다.
 */
function isoDateKST(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

async function main() {
  console.log("=== prod DB member_activities 정합성 확인 ===\n");

  const rows = await db
    .select({
      id: memberActivities.id,
      occurredAt: memberActivities.occurredAt,
      title: memberActivities.title,
      activityType: memberActivities.activityType,
      officialSourceUrl: memberActivities.officialSourceUrl,
    })
    .from(memberActivities)
    .orderBy(asc(memberActivities.occurredAt));

  console.log(`프로덕션: ${rows.length}건 / seed 정의: ${SEED_ENTRIES.length}건\n`);

  if (rows.length === 0) {
    console.log("[INFO] prod 에 member_activities 가 없습니다.");
    console.log("       db:seed:activities 실행 시 10건 전부 신규 삽입됩니다.");
    console.log("\n=== 결론 ===");
    console.log("✓ 정합성 OK (clean slate). push 안전.");
    process.exit(0);
  }

  const prodKey = (r: { occurredAt: Date; title: string }) =>
    `${isoDateKST(r.occurredAt)}|${r.title}`;
  const seedKey = (e: { date: string; title: string }) => `${e.date}|${e.title}`;

  const matched: typeof rows = [];
  const seedNew: typeof SEED_ENTRIES = [];
  const partialMatches: Array<{
    prod: (typeof rows)[number];
    seed: (typeof SEED_ENTRIES)[number];
    reason: string;
  }> = [];

  // seed → prod 대조
  for (const seed of SEED_ENTRIES) {
    const exact = rows.find((r) => prodKey(r) === seedKey(seed));
    if (exact) {
      matched.push(exact);
      continue;
    }
    const byDate = rows.filter((r) => isoDateKST(r.occurredAt) === seed.date);
    const byTitle = rows.filter((r) => r.title === seed.title);
    if (byDate.length > 0 && !matched.some((m) => m.id === byDate[0]!.id)) {
      partialMatches.push({
        prod: byDate[0]!,
        seed,
        reason: "같은 날짜지만 title 이 다름",
      });
    } else if (byTitle.length > 0 && !matched.some((m) => m.id === byTitle[0]!.id)) {
      partialMatches.push({
        prod: byTitle[0]!,
        seed,
        reason: "같은 title 이지만 날짜가 다름",
      });
    } else {
      seedNew.push(seed);
    }
  }

  // prod 에만 있는 항목 (seed 어디에도 매칭 안 된 row)
  const accountedIds = new Set<string>([
    ...matched.map((m) => m.id),
    ...partialMatches.map((p) => p.prod.id),
  ]);
  const prodOnly = rows.filter((r) => !accountedIds.has(r.id));

  // 출력
  if (matched.length > 0) {
    console.log(`[정확히 일치 — ${matched.length}건]`);
    for (const m of matched) {
      console.log(`  ✓ ${isoDateKST(m.occurredAt)} ${m.title}`);
    }
    console.log();
  }

  if (seedNew.length > 0) {
    console.log(`[seed 신규 — ${seedNew.length}건 (db:seed:activities 실행 시 삽입 예정)]`);
    for (const s of seedNew) {
      console.log(`  + ${s.date} ${s.title}`);
    }
    console.log();
  }

  if (partialMatches.length > 0) {
    console.log(
      `[부분 매치 — ${partialMatches.length}건 ⚠  seed 또는 prod 교정 필요]`,
    );
    for (const p of partialMatches) {
      console.log(`  ⚠  ${p.reason}`);
      console.log(
        `      prod: ${isoDateKST(p.prod.occurredAt)} "${p.prod.title}" (id: ${p.prod.id.slice(0, 8)})`,
      );
      console.log(`      seed: ${p.seed.date} "${p.seed.title}"`);
    }
    console.log();
  }

  if (prodOnly.length > 0) {
    console.log(`[prod 전용 — ${prodOnly.length}건 ⚠  seed 에 대응 항목 없음]`);
    for (const p of prodOnly) {
      console.log(
        `  ⚠  ${isoDateKST(p.occurredAt)} "${p.title}" (id: ${p.id.slice(0, 8)}, type: ${p.activityType})`,
      );
    }
    console.log();
  }

  // 결론
  const hasIssue = partialMatches.length > 0 || prodOnly.length > 0;
  console.log("=== 결론 ===");
  if (!hasIssue) {
    console.log(
      `✓ 정합성 OK. db:seed:activities 실행 시 신규 ${seedNew.length}건만 삽입됨. push 안전.`,
    );
    process.exit(0);
  }

  console.log("✗ 불일치 발견. 다음 중 선택:");
  if (partialMatches.length > 0) {
    console.log("   (a) seed-activities.ts 의 title/date 를 prod 값에 맞춰 수정 후 push");
    console.log("   (b) prod DB 의 해당 레코드를 UPDATE 로 seed 기준에 맞추기 (비권장)");
  }
  if (prodOnly.length > 0) {
    console.log(
      "   → prod 전용 레코드는 seed 에 추가하거나 수동 DELETE 로 정리",
    );
  }
  process.exit(1);
}

main().catch((err) => {
  console.error("\n✗ 예외로 중단:", err);
  process.exit(1);
});
