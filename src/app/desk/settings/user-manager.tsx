"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLES, ROLE_LABELS, type Role, canDo } from "@/lib/constants/roles";
import {
  changeUserRoleAction,
  createUserAction,
  resetUserPasswordAction,
  toggleUserActiveAction,
} from "./user-actions";
import { formatKoreanDateTime } from "@/lib/utils";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: Date | null;
}

export function UserManager({
  users,
  currentUserId,
  currentRole,
}: {
  users: UserRow[];
  currentUserId: string;
  currentRole: Role;
}) {
  const canManage = canDo(currentRole, "user.manage");

  return (
    <div className="space-y-6">
      {canManage ? <CreateUserForm /> : null}

      {/* 데스크톱: 테이블 */}
      <div className="hidden overflow-x-auto rounded border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-foreground/80 bg-muted/40">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                이메일
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                이름
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                역할
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                상태
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                마지막 로그인
              </th>
              <th className="w-[280px] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border">
                <td className="px-3 py-3 align-middle font-mono text-[12px]">
                  {u.email}
                  {u.id === currentUserId ? (
                    <span className="ml-1 text-[10px] uppercase tracking-wider text-primary">
                      (나)
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-3 align-middle">{u.name}</td>
                <td className="px-3 py-3 align-middle">
                  {canManage && u.id !== currentUserId ? (
                    <RoleSelect id={u.id} role={u.role} />
                  ) : (
                    ROLE_LABELS[u.role]
                  )}
                </td>
                <td className="px-3 py-3 align-middle text-sm">
                  {u.isActive ? (
                    <span className="text-foreground">활성</span>
                  ) : (
                    <span className="text-muted-foreground">비활성</span>
                  )}
                </td>
                <td className="px-3 py-3 align-middle text-muted-foreground">
                  {u.lastLoginAt ? formatKoreanDateTime(u.lastLoginAt) : "-"}
                </td>
                <td className="px-3 py-3 align-middle">
                  {canManage ? (
                    <div className="flex flex-wrap gap-1.5">
                      <ActiveToggle
                        id={u.id}
                        isActive={u.isActive}
                        disabled={u.id === currentUserId}
                      />
                      <ResetPassword id={u.id} />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">권한 없음</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일: 카드 */}
      <ul className="space-y-3 md:hidden">
        {users.map((u) => (
          <li key={u.id} className="card-line space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{u.name}</p>
                <p className="break-all font-mono text-xs text-muted-foreground">
                  {u.email}
                  {u.id === currentUserId ? (
                    <span className="ml-1 text-[10px] uppercase tracking-wider text-primary">
                      (나)
                    </span>
                  ) : null}
                </p>
              </div>
              <span
                className={
                  u.isActive
                    ? "rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                    : "rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                }
              >
                {u.isActive ? "활성" : "비활성"}
              </span>
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <span className="text-muted-foreground">역할</span>
              <span>
                {canManage && u.id !== currentUserId ? (
                  <RoleSelect id={u.id} role={u.role} />
                ) : (
                  ROLE_LABELS[u.role]
                )}
              </span>
              <span className="text-muted-foreground">마지막 로그인</span>
              <span className="text-muted-foreground">
                {u.lastLoginAt ? formatKoreanDateTime(u.lastLoginAt) : "-"}
              </span>
            </div>
            {canManage ? (
              <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                <ActiveToggle
                  id={u.id}
                  isActive={u.isActive}
                  disabled={u.id === currentUserId}
                />
                <ResetPassword id={u.id} />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, null as unknown);
  const err = (state as { error?: string } | null)?.error;
  const ok = state && (state as { ok?: boolean }).ok;

  return (
    <form action={formAction} className="card-line space-y-4 p-5">
      <h3>새 사용자 초대</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="new-email">이메일</Label>
          <Input id="new-email" name="email" type="email" required className="w-full" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-name">이름</Label>
          <Input id="new-name" name="name" required maxLength={60} className="w-full" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-role">역할</Label>
          <select
            id="new-role"
            name="role"
            defaultValue="editor"
            className="h-10 w-full rounded border border-input bg-background px-3 text-sm"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-password">초기 비밀번호</Label>
          <Input
            id="new-password"
            name="password"
            type="text"
            required
            minLength={8}
            className="w-full"
          />
          <p className="text-[11px] text-muted-foreground">
            최소 8자. 전달 후 즉시 변경을 요청하세요.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "생성 중…" : "사용자 생성"}
        </Button>
        {err ? <p className="text-sm text-destructive">{err}</p> : null}
        {ok ? <p className="text-sm text-foreground">생성되었습니다.</p> : null}
      </div>
    </form>
  );
}

function RoleSelect({ id, role }: { id: string; role: Role }) {
  const [state, formAction, pending] = useActionState(changeUserRoleAction, null as unknown);
  const err = (state as { error?: string } | null)?.error;

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="role"
        defaultValue={role}
        className="h-8 rounded border border-input bg-background px-2 text-xs"
        aria-label="역할"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "…" : "변경"}
      </Button>
      {err ? <span className="text-[11px] text-destructive">{err}</span> : null}
    </form>
  );
}

function ActiveToggle({
  id,
  isActive,
  disabled,
}: {
  id: string;
  isActive: boolean;
  disabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState(toggleUserActiveAction, null as unknown);
  const err = (state as { error?: string } | null)?.error;
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="isActive" value={isActive ? "false" : "true"} />
      <Button type="submit" size="sm" variant="outline" disabled={pending || disabled}>
        {pending ? "…" : isActive ? "비활성화" : "활성화"}
      </Button>
      {err ? <span className="ml-2 text-[11px] text-destructive">{err}</span> : null}
    </form>
  );
}

function ResetPassword({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(resetUserPasswordAction, null as unknown);
  const err = (state as { error?: string } | null)?.error;
  const msg = (state as { message?: string } | null)?.message;
  if (!open) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        비밀번호 재설정
      </Button>
    );
  }
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-1.5">
      <input type="hidden" name="id" value={id} />
      <Input
        name="password"
        type="text"
        placeholder="새 임시 비밀번호"
        minLength={8}
        required
        className="h-8 w-full text-xs sm:w-40"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "…" : "저장"}
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
        취소
      </Button>
      {err ? <span className="text-[11px] text-destructive">{err}</span> : null}
      {msg ? <span className="text-[11px] text-foreground">{msg}</span> : null}
    </form>
  );
}
