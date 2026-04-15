import { DeskSidebar } from "@/components/desk/sidebar";
import { ElectionBanner } from "@/components/common/election-banner";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { FLAG, getFlags } from "@/lib/feature-flags";
import { getOptionalSession } from "@/lib/auth/session";

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  // 로그인 페이지도 이 layout 을 지나가므로 session/flag 는 optional 하게.
  const [session, flags] = await Promise.all([
    getOptionalSession(),
    getFlags([FLAG.VOICE_ENABLED, FLAG.ELECTION_MODE]).catch(() => ({
      [FLAG.VOICE_ENABLED]: false,
      [FLAG.ELECTION_MODE]: true,
    })),
  ]);

  if (!session) {
    // 로그인 페이지는 sidebar 없이 노출 (자식에서 처리)
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <DeskSidebar
        voiceEnabled={flags[FLAG.VOICE_ENABLED]}
        userLabel={session.user.name || session.user.email}
        roleLabel={ROLE_LABELS[session.user.role]}
      />
      <main id="main" className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl space-y-6 p-6">
          <ElectionBanner enabled={flags[FLAG.ELECTION_MODE]} />
          {children}
        </div>
      </main>
    </div>
  );
}
