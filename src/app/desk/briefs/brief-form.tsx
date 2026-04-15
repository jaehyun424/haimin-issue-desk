"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBriefAction, updateBriefAction } from "./actions";

interface Props {
  mode: "create" | "edit";
  issueId: string;
  initial?: {
    id: string;
    title: string;
    summary: string;
    bodyMd: string;
  };
}

const TEMPLATE = `## 이슈 개요

## 현재 상황

## 이해민 의원/의원실 관련 활동

## 관련 법안/표결/회의/발언

## 참고한 공식 자료
- 출처 1 (예: 과기정통부 보도자료, 2026-04-12)
- 출처 2
`;

export function BriefForm({ mode, issueId, initial }: Props) {
  const action = mode === "create" ? createBriefAction : updateBriefAction;
  const [state, formAction, pending] = useActionState(action, null as unknown);
  const err = (state as { error?: string } | null)?.error;
  const ok = state && (state as { ok?: boolean }).ok;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="issueId" value={issueId} />
      {mode === "edit" ? <input type="hidden" name="id" value={initial?.id} /> : null}

      <div className="space-y-2">
        <Label htmlFor="brief-title">제목</Label>
        <Input
          id="brief-title"
          name="title"
          required
          maxLength={200}
          defaultValue={initial?.title}
          placeholder="사실형 제목. 자극적 수사 피함."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="brief-summary">요약 (3줄 이내)</Label>
        <Textarea
          id="brief-summary"
          name="summary"
          rows={3}
          required
          defaultValue={initial?.summary}
          placeholder="이 이슈의 핵심을 3줄 이내로."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="brief-body">본문 (Markdown)</Label>
        <Textarea
          id="brief-body"
          name="bodyMd"
          rows={18}
          required
          defaultValue={initial?.bodyMd ?? TEMPLATE}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          지원: 헤더(#/##/###), 리스트, 인용, 굵게/기울임, 링크. 이미지·HTML 은 지원하지 않습니다.
        </p>
      </div>

      {err ? <p className="text-sm text-destructive">{err}</p> : null}
      {ok ? <p className="text-sm text-foreground">저장되었습니다.</p> : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "저장 중…" : mode === "create" ? "초안 만들기" : "저장"}
        </Button>
      </div>
    </form>
  );
}
