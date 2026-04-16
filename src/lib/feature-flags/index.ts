/**
 * Feature flag 서비스.
 *
 * - DB 값이 있으면 그 값을, 없으면 env 기본값을 사용.
 * - 한 요청 내에서는 결과를 캐시(모듈 스코프 Map)하여 N번 질의 피함.
 * - "비 요청 환경"(seed, cron)에서도 동작.
 */
import { inArray } from "drizzle-orm";
import { FLAG, type FlagKey, defaultFlagSeeds } from "../constants/feature-flags";
import { db } from "../db";
import { featureFlags } from "../db/schema";

type FlagMap = Record<string, boolean>;

let cache: FlagMap | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 10_000;

function defaultMap(): FlagMap {
  return Object.fromEntries(defaultFlagSeeds().map((f) => [f.key, f.enabled]));
}

async function loadAll(): Promise<FlagMap> {
  const now = Date.now();
  if (cache && now - cachedAt < CACHE_TTL_MS) return cache;
  const rows = await db.select().from(featureFlags);
  const map: FlagMap = defaultMap();
  for (const r of rows) map[r.key] = r.enabled;
  cache = map;
  cachedAt = now;
  return map;
}

export function invalidateFlagCache() {
  cache = null;
  cachedAt = 0;
}

export async function getFlag(key: FlagKey): Promise<boolean> {
  const map = await loadAll();
  return map[key] ?? false;
}

export async function getFlags(keys: FlagKey[]): Promise<FlagMap> {
  const map = await loadAll();
  const out: FlagMap = {};
  for (const k of keys) out[k] = map[k] ?? false;
  return out;
}

export async function getAllFlags(): Promise<FlagMap> {
  return loadAll();
}

export async function setFlag(key: FlagKey, enabled: boolean): Promise<void> {
  await db
    .insert(featureFlags)
    .values({
      key,
      enabled,
      description: defaultFlagSeeds().find((f) => f.key === key)?.description,
    })
    .onConflictDoUpdate({
      target: featureFlags.key,
      set: { enabled, updatedAt: new Date() },
    });
  invalidateFlagCache();
}

export async function ensureDefaults(): Promise<void> {
  // 존재하지 않는 플래그만 insert. 기존 값은 건드리지 않음.
  const seeds = defaultFlagSeeds();
  const existing = await db
    .select({ key: featureFlags.key })
    .from(featureFlags)
    .where(inArray(featureFlags.key, seeds.map((s) => s.key)));
  const existingKeys = new Set(existing.map((e) => e.key));
  const toInsert = seeds.filter((s) => !existingKeys.has(s.key));
  if (toInsert.length === 0) return;
  await db.insert(featureFlags).values(toInsert);
  invalidateFlagCache();
}

export { FLAG };
export type { FlagKey };
