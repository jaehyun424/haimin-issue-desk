import { NextResponse } from "next/server";
import { runAllCollectors } from "@/lib/collectors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 주기적 수집 엔드포인트.
 *
 * 인증:
 *  - Vercel Cron: `Authorization: Bearer $CRON_SECRET` 자동 주입.
 *  - 수동 호출도 동일 헤더 필요. CRON_SECRET 미설정 시 항상 401 반환.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET not configured" }, { status: 401 });
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const results = await runAllCollectors();
  const allOk = results.every((r) => r.ok);
  return NextResponse.json(
    { ok: allOk, results },
    { status: allOk ? 200 : 207 },
  );
}
