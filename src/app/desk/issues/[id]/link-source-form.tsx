"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { linkSourceAction } from "../../sources/actions";

export function LinkSourceForm({ issueId }: { issueId: string }) {
  const [state, formAction, pending] = useActionState(linkSourceAction, null as unknown);
  const err = (state as { error?: string } | null)?.error;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="issueId" value={issueId} />
      <div className="space-y-1">
        <Label htmlFor="sourceDocumentId">출처 문서 ID</Label>
        <Input
          id="sourceDocumentId"
          name="sourceDocumentId"
          required
          placeholder="수집 문서 ID"
          className="font-mono text-xs"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPrimary" value="true" />
        1순위 출처로 표시
      </label>
      {err ? <p className="text-sm text-destructive">{err}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "연결 중…" : "출처 연결"}
      </Button>
    </form>
  );
}
