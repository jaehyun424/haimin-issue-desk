import { DeskShell } from "@/components/desk/desk-shell";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { FLAG, getFlags } from "@/lib/feature-flags";
import { getOptionalSession } from "@/lib/auth/session";

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
