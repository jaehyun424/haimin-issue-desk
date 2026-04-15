/**
 * Collector 공용 타입.
 *
 * 모든 collector 는 다음 shape 로 결과를 보고한다:
 * - ok: 부분 실패라도 전체 프로세스는 진행되도록 각 단계별 ok 플래그.
 * - inserted / updated / skipped 카운트로 관찰 가능성 확보.
 * - errors: 발생한 에러 메시지 목록.
 */

export interface CollectorResult {
  ok: boolean;
  collector: string;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
  startedAt: string;
  finishedAt: string;
}

export function emptyResult(name: string): CollectorResult {
  return {
    ok: true,
    collector: name,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    startedAt: new Date().toISOString(),
    finishedAt: "",
  };
}
