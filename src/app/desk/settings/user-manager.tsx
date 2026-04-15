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
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="table-gov">
            <tr>
              <th>이메일</th>
              <th>이름</th>
              <th>역할</th>
              <th>상태</th>
              <th>마지막 로그인</th>
              <th className="w-[280px]">관리</th>
            </tr>
          </thead>
          <tbody className="table-gov">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="font-mono text-[12px]">
                  {u.email}
                  {u.id === currentUserId ? (
                    <span className="ml-1 text-[10px] uppercase tracking-wider text-primary">
                      (나)
                    </span>
                  ) : null}
                </td>
                <td>{u.name}</td>
                <td>
                  {canManage && u.id !== currentUserId ? (
                    <RoleSelect id={u.id} role={u.role} />
                  ) : (
                    ROLE_LABELS[u.role]
                  )}
                </td>
                <td>
                  {u.isActive ? (
                    <span className="text-emerald-700">활성</span>
                  ) : (
                    <span className="text-muted-foreground">비활성</span>
                  )}
                </td>
                <td className="text-muted-foreground">
                  {u.lastLoginAt ? formatKoreanDateTime(u.lastLoginAt) : "-"}
                </td>
                <td>
                  {canManage ? (
                    <div className="flex flex-wrap gap-1.5">
                      <ActiveToggle id={u.id} isActive={u.isActive} disabled={u.id === currentUserId} />
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
          <Input id="new-email" name="email" type="email" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-name">이름</Label>
          <Input id="new-name" name="name" required maxLength={60} />
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
          <Input id="new-password" name="password" type="text" required minLength={8} />
          <p className="text-[11px] text-muted-foreground">
            최소 8자. 전달 후 즉시 변경을 요청하세요.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "생성 중…" : "사용자 생성"}
        </Button>
        {err ? <p className="text-sm text-destructive">{err}</p> : null}
        {ok ? <p className="text-sm text-emerald-700">생성되었습니다.</p> : null}
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
    <form action={formAction} className="flex items-center gap-1">
      <input type="hidden" name="id" value={id} />
      <Input
        name="password"
        type="text"
        placeholder="새 임시 비밀번호"
        minLength={8}
        required
        className="h-8 w-40 text-xs"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "…" : "저장"}
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
        취소
      </Button>
      {err ? <span className="ml-2 text-[11px] text-destructive">{err}</span> : null}
      {msg ? <span className="ml-2 text-[11px] text-emerald-700">{msg}</span> : null}
    </form>
  );
}
