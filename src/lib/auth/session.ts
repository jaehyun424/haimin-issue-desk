import "server-only";
import { redirect } from "next/navigation";
import type { Role, Capability } from "../constants/roles";
import { canDo } from "../constants/roles";
import { auth } from "./index";

export interface DeskSession {
  user: { id: string; email: string; name: string; role: Role };
}

/**
 * 서버 컴포넌트/서버 액션에서 호출.
 * 비로그인 → /desk/login 으로 리다이렉트.
 */
export async function requireDeskSession(): Promise<DeskSession> {
  const s = await auth();
  if (!s?.user?.id || !s.user.role) {
    redirect("/desk/login");
  }
  return {
    user: {
      id: s.user.id as string,
      email: s.user.email ?? "",
      name: s.user.name ?? "",
      role: s.user.role as Role,
    },
  };
}

/**
 * 특정 capability 가 필요한 액션 진입점.
 * 미보유 시 /desk 로 리다이렉트(행동 차단).
 */
export async function requireCapability(cap: Capability): Promise<DeskSession> {
  const s = await requireDeskSession();
  if (!canDo(s.user.role, cap)) {
    redirect("/desk?forbidden=1");
  }
  return s;
}

export async function getOptionalSession(): Promise<DeskSession | null> {
  const s = await auth();
  if (!s?.user?.id || !s.user.role) return null;
  return {
    user: {
      id: s.user.id as string,
      email: s.user.email ?? "",
      name: s.user.name ?? "",
      role: s.user.role as Role,
    },
  };
}
