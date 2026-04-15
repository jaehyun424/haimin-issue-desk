import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

const NAV: NavItem[] = [
  { href: "/", label: "홈" },
  { href: "/brief", label: "브리프" },
  { href: "/brief/activity", label: "의정활동" },
];

export function SiteHeader({ voiceEnabled }: { voiceEnabled: boolean }) {
  const items = voiceEnabled ? [...NAV, { href: "/voice", label: "정책 제안" }] : NAV;
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="rounded-sm bg-gov-navy px-2 py-1 text-xs font-semibold tracking-tight text-white">
            이해민 의원실
          </span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            과방위 의정 브리프
          </span>
        </Link>
        <nav aria-label="주요 메뉴" className="flex items-center gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
