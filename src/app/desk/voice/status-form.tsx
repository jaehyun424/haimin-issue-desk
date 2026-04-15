"use client";

import { useActionState } from "react";
import { VOICE_STATUSES, VOICE_STATUS_LABELS } from "@/lib/validation/voice";
import { Button } from "@/components/ui/button";
import { updateVoiceStatusAction } from "./actions";

interface Props {
  id: string;
  currentStatus: (typeof VOICE_STATUSES)[number];
}

export function VoiceStatusForm({ id, currentStatus }: Props) {
  const [state, formAction, pending] = useActionState(updateVoiceStatusAction, null as unknown);
  const err = (state as { error?: string } | null)?.error;
  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={currentStatus}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
        aria-label="상태 변경"
      >
        {VOICE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {VOICE_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "…" : "변경"}
      </Button>
      {err ? <span className="text-xs text-destructive">{err}</span> : null}
    </form>
  );
}
