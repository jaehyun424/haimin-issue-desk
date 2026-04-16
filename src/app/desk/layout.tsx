import type { Metadata } from "next";
import { DeskShell } from "@/components/desk/desk-shell";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { FLAG, getFlags } from "@/lib/feature-flags";
import { getOptionalSession } from "@/lib/auth/session";

/**
 * 내부 관리 콘솔 전체 트리에 noindex 지정.
 * - 검색엔진 크롤러가 /desk/* 경로를 인덱싱하지 않도록 한다.
 * - 개별 페이지 metadata 에서 이 값을 덮어쓰지 않도록 주의.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  // 로그인 페이지도 이 layout 을 지나가므로 session/flag 는 optional.
  const [session, flags] = await Promise.all([
    getOptionalSession(),
    getFlags([FLAG.VOICE_ENABLED]).catch(() => ({
      [FLAG.VOICE_ENABLED]: false,
    })),
  ]);

  if (!session) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <DeskShell
      voiceEnabled={flags[FLAG.VOICE_ENABLED]}
      userLabel={session.user.name || session.user.email}
      roleLabel={ROLE_LABELS[session.user.role]}
    >
      {children}
    </DeskShell>
  );
}
