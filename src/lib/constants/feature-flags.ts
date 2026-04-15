/**
 * Feature flag 키 상수 + env 기본값.
 *
 * - DB(`feature_flags` 테이블)에 값이 있으면 DB 값을 사용.
 * - DB에 값이 없을 때만 env 기본값으로 초기화.
 * - 코드에서는 반드시 `getFlag(key)` 를 통해 읽는다 (직접 env 참조 금지).
 */

export const FLAG = {
  VOICE_ENABLED: "voice_enabled",
  ELECTION_MODE: "election_mode",
  AI_ENABLED: "ai_enabled",
} as const;

export type FlagKey = (typeof FLAG)[keyof typeof FLAG];

export interface FlagSeed {
  key: FlagKey;
  enabled: boolean;
  description: string;
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null) return fallback;
  return value === "1" || value.toLowerCase() === "true";
}

export function defaultFlagSeeds(): FlagSeed[] {
  return [
    {
      key: FLAG.VOICE_ENABLED,
      enabled: parseBool(process.env.FEATURE_VOICE_DEFAULT, false),
      description: "voice(정책 제안 접수) 공개 여부. 초기 배포 OFF.",
    },
    {
      key: FLAG.ELECTION_MODE,
      enabled: parseBool(process.env.FEATURE_ELECTION_MODE_DEFAULT, true),
      description: "발행 안전모드. 켜짐일 때 자동 발행 금지 및 검토자 승인 필수.",
    },
    {
      key: FLAG.AI_ENABLED,
      enabled: parseBool(process.env.FEATURE_AI_DEFAULT, false),
      description: "AI 도우미(요약/분류) 사용 여부. OFF여도 앱 전체 동작.",
    },
  ];
}
