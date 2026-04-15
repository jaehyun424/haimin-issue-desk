"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { canDo, type Role } from "@/lib/constants/roles";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "./actions";

interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export function CategoryEditor({
  categories,
  role,
}: {
  categories: Category[];
  role: Role;
}) {
  const canManage = canDo(role, "category.manage");

  return (
    <div className="space-y-4">
      {canManage ? <CategoryCreateForm /> : null}
      <ul className="divide-y divide-border">
        {categories.map((c) => (
          <li key={c.id} className="py-3">
            <CategoryRow category={c} canManage={canManage} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryCreateForm() {
  const [state, formAction, pending] = useActionState(createCategoryAction, null as unknown);
  const err = (state as { error?: string } | null)?.error;
  return (
    <form action={formAction} className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
      <div>
        <Label className="sr-only" htmlFor="new-cat-name">
          카테고리명
        </Label>
        <Input id="new-cat-name" name="name" placeholder="새 카테고리명" required />
      </div>
      <div>
        <Label className="sr-only" htmlFor="new-cat-order">
          정렬 순서
        </Label>
        <Input
          id="new-cat-order"
          name="sortOrder"
          type="number"
          placeholder="정렬"
          defaultValue={1000}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "추가 중…" : "추가"}
      </Button>
      {err ? <p className="sm:col-span-3 text-sm text-destructive">{err}</p> : null}
    </form>
  );
}

function CategoryRow({ category, canManage }: { category: Category; canManage: boolean }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateCategoryAction, null as unknown);
  const [delState, deleteAction, deletePending] = useActionState(
    deleteCategoryAction,
    null as unknown,
  );
  const err = (state as { error?: string } | null)?.error;
  const delErr = (delState as { error?: string } | null)?.error;

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">
            {category.name}
            {!category.isActive ? (
              <span className="ml-2 text-xs text-muted-foreground">(비활성)</span>
            ) : null}
          </p>
          <p className="text-xs text-muted-foreground">정렬 {category.sortOrder}</p>
        </div>
        {canManage ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              편집
            </Button>
            <form
              action={deleteAction}
              onSubmit={(e) => {
                if (!confirm("이 카테고리를 삭제할까요? 연결된 이슈는 보조 카테고리만 제거됩니다."))
                  e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={category.id} />
              <Button
                size="sm"
                variant="destructive"
                type="submit"
                disabled={deletePending}
              >
                {deletePending ? "삭제 중…" : "삭제"}
              </Button>
            </form>
          </div>
        ) : null}
        {delErr ? <span className="text-xs text-destructive">{delErr}</span> : null}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="grid gap-2 sm:grid-cols-[1fr_100px_auto_auto]"
      onSubmit={() => setEditing(false)}
    >
      <input type="hidden" name="id" value={category.id} />
      <Input name="name" defaultValue={category.name} required />
      <Input name="sortOrder" type="number" defaultValue={category.sortOrder} />
      <label className="flex items-center gap-2 text-xs">
        <Checkbox name="isActive" defaultChecked={category.isActive} />
        활성
      </label>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          저장
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
          취소
        </Button>
      </div>
      {err ? <p className="sm:col-span-4 text-sm text-destructive">{err}</p> : null}
    </form>
  );
}
