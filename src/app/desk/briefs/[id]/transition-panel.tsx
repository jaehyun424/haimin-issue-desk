"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { type BRIEF_STATUSES, BRIEF_STATUS_LABELS } from "@/lib/validation/brief";
import { canDo, type Role } from "@/lib/constants/roles";
import { transitionBriefAction } from "../actions";

interface Props {
  id: string;
  currentStatus: (typeof BRIEF_STATUSES)[number];
  sourceCount: number;
  role: Role;
}

export function BriefTransitionPanel({ id, currentStatus, sourceCount, role }: Props) {
  const [state, formAction, pending] = useActionState(transitionBriefAction, null as unknown);
  const err = (state as { error?: string } | null)?.error;

  const canReview = canDo(role, "brief.draft");
  const canPublish = canDo(role, "brief.publish");
  const canArchive = canDo(role, "brief.review");

  const transitions: Array<{
    to: (typeof BRIEF_STATUSES)[number];
    label: string;
    disabled: boolean;
    hint?: string;
    variant: "default" | "outline" | "destructive" | "secondary";
  }> = [];
  if (currentStatus === "draft") {
    transitions.push({
      to: "review",
      label: "검토 요청",
      disabled: !canReview,
      variant: "default",
    });
  }
  if (currentStatus === "review") {
    transitions.push({
      to: "published",
      label: "발행",
      disabled: !canPublish || sourceCount === 0,
      hint: sourceCount === 0 ? "출처 1건 이상 필요" : "발행 권한이 없으면 비활성",
      variant: "default",
    });
    transitions.push({
      to: "draft",
      label: "초안으로 되돌리기",
      disabled: !canReview,
      variant: "secondary",
    });
  }
  if (currentStatus === "published") {
    transitions.push({
      to: "archived",
      label: "아카이브",
      disabled: !canArchive,
      variant: "destructive",
    });
  }
  if (currentStatus === "archived") {
    transitions.push({
      to: "draft",
      label: "다시 초안으로",
      disabled: !canReview,
      variant: "secondary",
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        현재 상태: <strong>{BRIEF_STATUS_LABELS[currentStatus]}</strong>
      </p>
      {transitions.length === 0 ? (
        <p className="text-sm text-muted-foreground">가능한 상태 전환이 없습니다.</p>
      ) : null}
      {transitions.map((t) => (
        <form key={t.to} action={formAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={t.to} />
          <Button
            type="submit"
            variant={t.variant}
            disabled={pending || t.disabled}
            className="w-full"
          >
            {pending ? "처리 중…" : t.label}
          </Button>
          {t.hint && t.disabled ? (
            <p className="mt-1 text-xs text-muted-foreground">{t.hint}</p>
          ) : null}
        </form>
      ))}
      {err ? <p className="text-sm text-destructive">{err}</p> : null}
    </div>
  );
}
