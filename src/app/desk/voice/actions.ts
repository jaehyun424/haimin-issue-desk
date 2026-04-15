"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { voiceSubmissions } from "@/lib/db/schema";
import { requireCapability } from "@/lib/auth/session";
import { writeAudit } from "@/lib/audit";
import { uuid } from "@/lib/validation/common";
import { VOICE_STATUSES } from "@/lib/validation/voice";

const schema = z.object({
  id: uuid,
  status: z.enum(VOICE_STATUSES),
});

export async function updateVoiceStatusAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("voice.triage");
  const parsed = schema.safeParse({
    id: fd.get("id")?.toString(),
    status: fd.get("status")?.toString(),
  });
  if (!parsed.success) return { ok: false, error: "잘못된 입력" } as const;

  await db
    .update(voiceSubmissions)
    .set({
      status: parsed.data.status,
      assignedUserId: session.user.id,
      updatedAt: new Date(),
    })
    .where(eq(voiceSubmissions.id, parsed.data.id));

  await writeAudit({
    actorUserId: session.user.id,
    action: "voice.update_status",
    targetType: "voice_submission",
    targetId: parsed.data.id,
    payload: { status: parsed.data.status },
  });
  revalidatePath("/desk/voice");
  return { ok: true } as const;
}
