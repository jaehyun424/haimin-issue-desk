"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireCapability } from "@/lib/auth/session";
import { writeAudit } from "@/lib/audit";
import { hashPassword } from "@/lib/auth/password";
import {
  userActiveSchema,
  userCreateSchema,
  userResetPasswordSchema,
  userRoleSchema,
} from "@/lib/validation/user";

export async function createUserAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("user.manage");
  const parsed = userCreateSchema.safeParse({
    email: fd.get("email")?.toString(),
    name: fd.get("name")?.toString(),
    role: fd.get("role")?.toString(),
    password: fd.get("password")?.toString(),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력 오류" } as const;
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  if (existing.length > 0) {
    return { ok: false, error: "이미 존재하는 이메일입니다." } as const;
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const [created] = await db
    .insert(users)
    .values({
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
      passwordHash,
      isActive: true,
    })
    .returning({ id: users.id });

  await writeAudit({
    actorUserId: session.user.id,
    action: "user.create",
    targetType: "user",
    targetId: created?.id ?? null,
    payload: { email: parsed.data.email, role: parsed.data.role },
  });

  revalidatePath("/desk/settings");
  return { ok: true } as const;
}

export async function changeUserRoleAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("user.manage");
  const parsed = userRoleSchema.safeParse({
    id: fd.get("id")?.toString(),
    role: fd.get("role")?.toString(),
  });
  if (!parsed.success) return { ok: false, error: "잘못된 입력" } as const;

  if (parsed.data.id === session.user.id) {
    return { ok: false, error: "본인의 역할은 직접 변경할 수 없습니다." } as const;
  }

  await db
    .update(users)
    .set({ role: parsed.data.role, updatedAt: new Date() })
    .where(eq(users.id, parsed.data.id));

  await writeAudit({
    actorUserId: session.user.id,
    action: "user.update",
    targetType: "user",
    targetId: parsed.data.id,
    payload: { role: parsed.data.role },
  });

  revalidatePath("/desk/settings");
  return { ok: true } as const;
}

export async function toggleUserActiveAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("user.manage");
  const parsed = userActiveSchema.safeParse({
    id: fd.get("id")?.toString(),
    isActive: fd.get("isActive") === "true",
  });
  if (!parsed.success) return { ok: false, error: "잘못된 입력" } as const;

  if (parsed.data.id === session.user.id && !parsed.data.isActive) {
    return { ok: false, error: "본인 계정을 비활성화할 수 없습니다." } as const;
  }

  await db
    .update(users)
    .set({ isActive: parsed.data.isActive, updatedAt: new Date() })
    .where(eq(users.id, parsed.data.id));

  await writeAudit({
    actorUserId: session.user.id,
    action: parsed.data.isActive ? "user.update" : "user.deactivate",
    targetType: "user",
    targetId: parsed.data.id,
    payload: { isActive: parsed.data.isActive },
  });

  revalidatePath("/desk/settings");
  return { ok: true } as const;
}

export async function resetUserPasswordAction(_prev: unknown, fd: FormData) {
  const session = await requireCapability("user.manage");
  const parsed = userResetPasswordSchema.safeParse({
    id: fd.get("id")?.toString(),
    password: fd.get("password")?.toString(),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "오류" } as const;
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, parsed.data.id));

  await writeAudit({
    actorUserId: session.user.id,
    action: "user.update",
    targetType: "user",
    targetId: parsed.data.id,
    payload: { passwordReset: true },
  });

  revalidatePath("/desk/settings");
  return { ok: true, message: "임시 비밀번호가 설정되었습니다. 본인에게 전달한 뒤 즉시 변경을 요청하세요." } as const;
}
