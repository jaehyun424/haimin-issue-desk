"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SOURCE_TYPES, SOURCE_TYPE_LABELS } from "@/lib/validation/source";
import { createSourceAction } from "./actions";

export function CreateSourceForm() {
  const [state, formAction, pending] = useActionState(createSourceAction, null as unknown);
  const err = (state as { error?: string } | null)?.error;
  const id = (state as { id?: string } | null)?.id;

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1 sm:col-span-2">
        <Label htmlFor="src-title">제목</Label>
        <Input id="src-title" name="title" required maxLength={300} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="src-source-name">출처 기관/매체</Label>
        <Input id="src-source-name" name="sourceName" required maxLength={100} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="src-type">유형</Label>
        <select
          id="src-type"
          name="sourceType"
          defaultValue="manual"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {SOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {SOURCE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label htmlFor="src-url">URL</Label>
        <Input id="src-url" name="url" type="url" placeholder="https://…" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="src-published">발행일</Label>
        <Input id="src-published" name="publishedAt" type="date" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="src-external">외부 ID</Label>
        <Input id="src-external" name="externalId" maxLength={120} />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label htmlFor="src-body">내부 메모</Label>
        <Textarea
          id="src-body"
          name="bodyText"
          rows={3}
          placeholder="요약/발췌. 외부 기사 전문은 가급적 저장하지 않습니다."
        />
      </div>
      {err ? <p className="sm:col-span-2 text-sm text-destructive">{err}</p> : null}
      {id ? (
        <p className="sm:col-span-2 text-sm text-emerald-700">
          저장되었습니다. ID: <code>{id}</code>
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중…" : "수집 문서 저장"}
        </Button>
      </div>
    </form>
  );
}
