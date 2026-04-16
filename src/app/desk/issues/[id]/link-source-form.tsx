"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatKoreanDate } from "@/lib/utils";
import { linkSourceAction } from "../../sources/actions";

export interface LinkableSource {
  id: string;
  title: string;
  sourceName: string;
  publishedAt: Date | string | null;
}

export function LinkSourceForm({
  issueId,
  options,
}: {
  issueId: string;
  options: LinkableSource[];
}) {
  const [state, formAction, pending] = useActionState(linkSourceAction, null as unknown);
  const err = (state as { error?: string } | null)?.error;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="issueId" value={issueId} />
      <div className="space-y-1">
        <Label htmlFor="sourceDocumentId">연결할 수집 문서</Label>
        <select
          id="sourceDocumentId"
          name="sourceDocumentId"
          required
          defaultValue=""
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="" disabled>
            {options.length === 0 ? "연결 가능한 문서가 없습니다" : "문서 선택"}
          </option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.publishedAt ? `[${formatKoreanDate(o.publishedAt)}] ` : ""}
              {o.title} · {o.sourceName}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          최근 등록된 수집 문서 중에서 선택합니다. 원하는 문서가 목록에 없으면{" "}
          <a className="underline underline-offset-4" href="/desk/sources">
            수집 문서
          </a>
          에서 먼저 등록해 주세요.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPrimary" value="true" />
        주요 출처로 지정
      </label>
      {err ? <p className="text-sm text-destructive">{err}</p> : null}
      <Button type="submit" size="sm" disabled={pending || options.length === 0}>
        {pending ? "연결 중…" : "출처 연결"}
      </Button>
    </form>
  );
}
