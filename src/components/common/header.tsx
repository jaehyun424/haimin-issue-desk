import Link from "next/link";

interface NavItem {
  href: string;
  label: string;
}

const NAV: NavItem[] = [
  { href: "/brief", label: "브리프" },
  { href: "/brief/activity", label: "의정활동" },
];

export function SiteHeader({ voiceEnabled }: { voiceEnabled: boolean }) {
  const items = voiceEnabled ? [...NAV, { href: "/voice", label: "정책 제안" }] : NAV;
  return (
    <header className="border-b border-border bg-background">
      <div className="gov-strip" aria-hidden />
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            이해민 의원실
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            과방위 의정 브리프
          </span>
        </Link>
        <nav aria-label="주요 메뉴" className="flex items-center gap-5">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-foreground/80 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
