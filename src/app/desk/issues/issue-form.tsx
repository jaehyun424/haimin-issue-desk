"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ISSUE_PRIORITIES,
  ISSUE_PRIORITY_LABELS,
  ISSUE_STATUSES,
  ISSUE_STATUS_LABELS,
} from "@/lib/validation/issue";
import {
  createIssueAction,
  updateIssueAction,
} from "./actions";

interface Option {
  id: string;
  name: string;
  email?: string;
}

export interface IssueFormValues {
  id?: string;
  title?: string;
  summary?: string | null;
  status?: (typeof ISSUE_STATUSES)[number];
  priority?: (typeof ISSUE_PRIORITIES)[number];
  primaryCategoryId?: string | null;
  ownerUserId?: string | null;
  categoryIds?: string[];
}

interface Props {
  mode: "create" | "edit";
  categories: Option[];
  owners: Option[];
  initial?: IssueFormValues;
}

export function IssueForm({ mode, categories, owners, initial }: Props) {
  const action = mode === "create" ? createIssueAction : updateIssueAction;
  const [state, formAction, pending] = useActionState(action, null as unknown);

  const selected = new Set(initial?.categoryIds ?? []);
  const err = (state as { error?: string } | null)?.error;

  return (
    <form action={formAction} className="space-y-5">
      {mode === "edit" ? <input type="hidden" name="id" value={initial?.id} /> : null}

      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={initial?.title ?? ""}
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">요약</Label>
        <Textarea
          id="summary"
          name="summary"
          rows={4}
          defaultValue={initial?.summary ?? ""}
          placeholder="이슈의 요점 2~3줄"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">상태</Label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "new"}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {ISSUE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ISSUE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">우선순위</Label>
          <select
            id="priority"
            name="priority"
            defaultValue={initial?.priority ?? "medium"}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {ISSUE_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {ISSUE_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="primaryCategoryId">주 카테고리</Label>
          <select
            id="primaryCategoryId"
            name="primaryCategoryId"
            defaultValue={initial?.primaryCategoryId ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">선택 안 함</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownerUserId">담당자</Label>
          <select
            id="ownerUserId"
            name="ownerUserId"
            defaultValue={initial?.ownerUserId ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">미지정</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} {o.email ? `(${o.email})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">보조 카테고리 (복수 선택)</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                name="categoryIds"
                value={c.id}
                defaultChecked={selected.has(c.id)}
              />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>

      {err ? <p className="text-sm text-destructive">{err}</p> : null}
      {state && (state as { ok?: boolean }).ok ? (
        <p className="text-sm text-emerald-600">저장되었습니다.</p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중…" : "저장"}
        </Button>
      </div>
    </form>
  );
}
