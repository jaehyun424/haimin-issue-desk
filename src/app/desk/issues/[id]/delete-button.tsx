"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { deleteIssueAction } from "../actions";

export function DeleteIssueButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [state, formAction, pending] = useActionState(deleteIssueAction, null as unknown);
  const err = (state as { error?: string } | null)?.error;

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("이 이슈를 삭제할까요? 발행된 이슈는 삭제할 수 없고 아카이브해야 합니다."))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        disabled={pending || disabled}
        title={disabled ? "발행된 이슈는 삭제할 수 없습니다" : undefined}
      >
        {pending ? "삭제 중…" : "삭제"}
      </Button>
      {err ? <span className="ml-2 text-xs text-destructive">{err}</span> : null}
    </form>
  );
}
