"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { voiceSubmissions } from "@/lib/db/schema";
import { FLAG, getFlag } from "@/lib/feature-flags";
import { VOICE_TYPES, voiceSubmitSchema } from "@/lib/validation/voice";
import { verifyTurnstile } from "@/lib/captcha/turnstile";
import { hashIp, rateLimit } from "@/lib/rate-limit";
import { writeAudit } from "@/lib/audit";

export async function submitVoiceAction(_prev: unknown, fd: FormData) {
  const enabled = await getFlag(FLAG.VOICE_ENABLED);
  if (!enabled) return { ok: false, error: "현재 의견 접수가 운영되지 않습니다." } as const;

  const h = await headers();
  const ipRaw = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ipKey = ipRaw ? await hashIp(ipRaw) : "unknown";

  const limit = await rateLimit(`voice:${ipKey}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return {
      ok: false,
      error: "제출 속도 제한에 도달했습니다. 1시간 뒤 다시 시도해 주세요.",
    } as const;
  }

  const typeInput = fd.get("type")?.toString();
  const type = (VOICE_TYPES as readonly string[]).includes(typeInput ?? "")
    ? (typeInput as (typeof VOICE_TYPES)[number])
    : undefined;
  if (!type) return { ok: false, error: "제출 유형을 선택해 주세요." } as const;

  // 개인 민원 은 접수하지 않고 안내 페이지로 유도. 의견 내용은 저장하지 않는다.
  if (type === "personal_grievance") {
    redirect("/voice/submitted?kind=grievance");
  }
  if (type === "partnership") {
    return {
      ok: false,
      error:
        "협업·인터뷰 요청은 의원실 공식 이메일로 직접 연락해 주세요. (사이트 접수 대상이 아닙니다.)",
    } as const;
  }

  const parsed = voiceSubmitSchema.safeParse({
    type,
    categoryId: fd.get("categoryId")?.toString() || undefined,
    displayName: fd.get("displayName")?.toString() ?? undefined,
    email: fd.get("email")?.toString() ?? undefined,
    title: fd.get("title")?.toString() ?? "",
    body: fd.get("body")?.toString() ?? "",
    consentRequired: fd.get("consentRequired") === "on" || fd.get("consentRequired") === "true",
    consentOptionalContact:
      fd.get("consentOptionalContact") === "on" ||
      fd.get("consentOptionalContact") === "true",
    turnstileToken: fd.get("cf-turnstile-response")?.toString() ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력 오류" } as const;
  }

  const captcha = await verifyTurnstile(parsed.data.turnstileToken, ipRaw || undefined);
  if (!captcha.success) {
    return { ok: false, error: "자동화 방지 확인에 실패했습니다." } as const;
  }

  const [created] = await db
    .insert(voiceSubmissions)
    .values({
      type: parsed.data.type,
      categoryId: parsed.data.categoryId ?? null,
      displayName: parsed.data.displayName || null,
      email: parsed.data.email || null,
      title: parsed.data.title,
      body: parsed.data.body,
      consentRequired: parsed.data.consentRequired,
      consentOptionalContact: parsed.data.consentOptionalContact,
      status: "new",
      ipHash: ipKey,
      captchaVerdict: captcha.verdict,
    })
    .returning({ id: voiceSubmissions.id });

  await writeAudit({
    actorUserId: null,
    action: "voice.update_status",
    targetType: "voice_submission",
    targetId: created?.id ?? null,
    payload: { event: "submitted", type: parsed.data.type },
  });

  redirect("/voice/submitted");
}
