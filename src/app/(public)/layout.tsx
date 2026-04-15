import { SiteFooter } from "@/components/common/footer";
import { SiteHeader } from "@/components/common/header";
import { FLAG, getFlags } from "@/lib/feature-flags";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const flags = await getFlags([FLAG.VOICE_ENABLED]).catch(() => ({
    [FLAG.VOICE_ENABLED]: false,
  }));
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader voiceEnabled={flags[FLAG.VOICE_ENABLED]} />
      <main id="main" className="container flex-1 py-8">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
