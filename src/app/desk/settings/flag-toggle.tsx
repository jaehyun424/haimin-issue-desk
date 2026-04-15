"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { canDo, type Role } from "@/lib/constants/roles";
import { toggleFlagAction } from "./actions";

interface Props {
  flagKey: string;
  enabled: boolean;
  role: Role;
}

export function FlagToggle({ flagKey, enabled, role }: Props) {
  const [state, formAction, pending] = useActionState(toggleFlagAction, null as unknown);
  const err = (state as { error?: string } | null)?.error;
  const canManage = canDo(role, "flag.manage");

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="key" value={flagKey} />
      <input type="hidden" name="enabled" value={enabled ? "false" : "true"} />
      <span
        className={`rounded-md px-2 py-0.5 text-xs font-medium ${
          enabled ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"
        }`}
      >
        {enabled ? "ON" : "OFF"}
      </span>
      <Button type="submit" size="sm" variant="outline" disabled={pending || !canManage}>
        {pending ? "…" : enabled ? "끄기" : "켜기"}
      </Button>
      {err ? <span className="text-xs text-destructive">{err}</span> : null}
    </form>
  );
}
