import "server-only";
import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { memberActivities, sourceDocuments } from "../db/schema";
import { type CollectorResult, emptyResult } from "./types";

/**
 * 국회 Open API (열린국회정보) 수집기.
 *
 * - endpoint: https://open.assembly.go.kr/portal/openapi/{SERVICE_CODE}
 * - ASSEMBLY_API_KEY 가 없으면 **즉시 graceful skip** 하고 ok=true 로 반환한다.
 *   (의도적 설계: 키 없어도 앱이 돌아야 함)
 * - 발의법률안(TVBPMBILL11)을 MONA_CD 필터로 호출. MONA_CD 는 DB 에 저장된
 *   "member_mona_cd" setting 값을 1순위, env 를 fallback 으로 사용.
 * - 중복 방지: external_id + url + title 조합을 sha256 으로 해시하여 비교.
 *
 * v1 에서는 이 collector 만 구현한다 (표결, 일정 등은 v1.5).
 */

const BASE_URL = "https://open.assembly.go.kr/portal/openapi";
const SERVICE_CODE = "TVBPMBILL11"; // 의원 대표발의 법률안 목록
const AGE = "22"; // 22대 국회

async function resolveMonaCd(): Promise<string | null> {
  // DB setting 이 있으면 우선. 없으면 env. 둘 다 없으면 null.
  // NOTE: 구현 편의상 setting 테이블이 없으므로 env 만 본다.
  // (PRD 의 "하드코딩 금지" 원칙에 따라 실제 값은 env 로 주입)
  const v = process.env.HAIMIN_MONA_CD;
  return v && v.length > 0 ? v : null;
}

interface BillRow {
  BILL_ID?: string;
  BILL_NO?: string;
  BILL_NAME?: string;
  PROPOSE_DT?: string;
  PROC_RESULT?: string;
  DETAIL_LINK?: string;
  COMMITTEE?: string;
  PROPOSER?: string;
}

interface AssemblyResponse {
  [code: string]: unknown;
}

/**
 * 열린국회 API 응답 해석.
 * 응답 구조: { [SERVICE_CODE]: [ { head: [...] }, { row: [...] } ] }
 */
function extractRows(json: AssemblyResponse, serviceCode: string): BillRow[] {
  const raw = (json as Record<string, unknown>)[serviceCode];
  if (!Array.isArray(raw)) return [];
  for (const block of raw as Array<Record<string, unknown>>) {
    const rows = block["row"];
    if (Array.isArray(rows)) return rows as BillRow[];
  }
  return [];
}

function hashBill(b: BillRow): string {
  const key = [b.BILL_ID ?? "", b.BILL_NAME ?? "", b.PROPOSE_DT ?? ""].join("|");
  return createHash("sha256").update(key).digest("hex").slice(0, 40);
}

function parseAssemblyDate(s: string | undefined): Date | null {
  if (!s) return null;
  // API 는 "YYYY-MM-DD" 형식 반환
  const d = new Date(`${s}T00:00:00+09:00`);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * 의원 발의안 수집.
 *
 * @param options.pageSize 1회 요청당 레코드 수 (최대 1000)
 * @param options.maxPages 최대 페이지 수 (rate-limit 보호용)
 */
export async function collectAssemblyBills(
  options: { pageSize?: number; maxPages?: number } = {},
): Promise<CollectorResult> {
  const result = emptyResult("assembly.bills");
  const apiKey = process.env.ASSEMBLY_API_KEY;
  if (!apiKey) {
    result.finishedAt = new Date().toISOString();
    result.errors.push("ASSEMBLY_API_KEY 미설정 — skip");
    return result;
  }

  const monaCd = await resolveMonaCd();
  if (!monaCd) {
    result.finishedAt = new Date().toISOString();
    result.errors.push("HAIMIN_MONA_CD 미설정 — 의원 식별자 없음, skip");
    return result;
  }

  const pageSize = Math.min(options.pageSize ?? 100, 1000);
  const maxPages = options.maxPages ?? 5;

  try {
    for (let pIndex = 1; pIndex <= maxPages; pIndex += 1) {
      const url = new URL(`${BASE_URL}/${SERVICE_CODE}`);
      url.searchParams.set("KEY", apiKey);
      url.searchParams.set("Type", "json");
      url.searchParams.set("pIndex", String(pIndex));
      url.searchParams.set("pSize", String(pageSize));
      url.searchParams.set("AGE", AGE);
      url.searchParams.set("MONA_CD", monaCd);

      const res = await fetch(url.toString(), {
        headers: { accept: "application/json" },
        // Vercel cron 환경에서는 캐시 비활성 권장
        cache: "no-store",
      });
      if (!res.ok) {
        result.errors.push(`HTTP ${res.status} at page ${pIndex}`);
        result.ok = false;
        break;
      }
      const json = (await res.json()) as AssemblyResponse;
      const rows = extractRows(json, SERVICE_CODE);
      if (rows.length === 0) break;

      for (const row of rows) {
        if (!row.BILL_ID || !row.BILL_NAME) {
          result.skipped += 1;
          continue;
        }
        const occurredAt = parseAssemblyDate(row.PROPOSE_DT);
        const hash = hashBill(row);

        // 1) source_documents upsert (external_id 로 식별)
        const [existingSource] = await db
          .select({ id: sourceDocuments.id })
          .from(sourceDocuments)
          .where(
            and(
              eq(sourceDocuments.sourceType, "assembly_api"),
              eq(sourceDocuments.externalId, row.BILL_ID),
            ),
          )
          .limit(1);
        if (existingSource) {
          result.skipped += 1;
        } else {
          await db.insert(sourceDocuments).values({
            sourceType: "assembly_api",
            sourceName: "열린국회정보",
            externalId: row.BILL_ID,
            url: row.DETAIL_LINK ?? null,
            title: row.BILL_NAME,
            publishedAt: occurredAt,
            fetchedAt: new Date(),
            hash,
            metadataJson: {
              billNo: row.BILL_NO,
              procResult: row.PROC_RESULT,
              committee: row.COMMITTEE,
              proposer: row.PROPOSER,
            },
          });
          result.inserted += 1;
        }

        // 2) member_activities (bill 유형) 중복 방지
        if (occurredAt) {
          const [existingActivity] = await db
            .select({ id: memberActivities.id })
            .from(memberActivities)
            .where(
              and(
                eq(memberActivities.activityType, "bill"),
                eq(memberActivities.title, row.BILL_NAME),
              ),
            )
            .limit(1);
          if (!existingActivity) {
            await db.insert(memberActivities).values({
              activityType: "bill",
              occurredAt,
              title: row.BILL_NAME,
              summary: row.PROC_RESULT ? `처리결과: ${row.PROC_RESULT}` : null,
              officialSourceUrl: row.DETAIL_LINK ?? null,
              metadataJson: {
                billId: row.BILL_ID,
                billNo: row.BILL_NO,
                committee: row.COMMITTEE,
              },
            });
          }
        }
      }

      if (rows.length < pageSize) break; // last page
    }
  } catch (err) {
    result.ok = false;
    result.errors.push(err instanceof Error ? err.message : String(err));
  }

  result.finishedAt = new Date().toISOString();
  return result;
}
