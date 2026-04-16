/**
 * 발행 가드 (순수 함수).
 *
 * 서버 액션 `transitionBriefAction` 이 발행 전에 검증하는 것과 동일한 규칙.
 * 여기에 따로 추출한 이유: 단위 테스트 가능성 + 다른 진입점(API, 테스트)에서 재사용.
 */

export interface PublishInputs {
  summaryLength: number;
  bodyLength: number;
  sourceCount: number;
  electionModeOn: boolean;
  currentStatus: "draft" | "review" | "published" | "archived";
}

export type PublishCheck =
  | { ok: true }
  | { ok: false; code: "too_short" | "no_source" | "must_review_first"; message: string };

export function checkPublishable(input: PublishInputs): PublishCheck {
  if (input.summaryLength < 10 || input.bodyLength < 20) {
    return { ok: false, code: "too_short", message: "요약/본문이 너무 짧습니다." };
  }
  if (input.sourceCount < 1) {
    return {
      ok: false,
      code: "no_source",
      message: "공개 브리프는 최소 1건 이상의 연결 출처가 필요합니다.",
    };
  }
  if (input.electionModeOn && input.currentStatus !== "review") {
    return {
      ok: false,
      code: "must_review_first",
      message:
        "발행 안전모드에서는 검토 단계를 거쳐야 발행할 수 있습니다.",
    };
  }
  return { ok: true };
}
