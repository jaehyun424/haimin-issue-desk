import "server-only";
import { collectAssemblyBills } from "./assembly";
import type { CollectorResult } from "./types";

/**
 * 모든 수집기 실행. 일부 실패해도 다른 것은 계속 진행한다.
 */
export async function runAllCollectors(): Promise<CollectorResult[]> {
  const results: CollectorResult[] = [];
  results.push(await collectAssemblyBills());
  // 여기에 Naver News, 정책브리핑 RSS, KISA RSS 추가 예정 (v1.5)
  return results;
}

export { collectAssemblyBills };
export type { CollectorResult };
