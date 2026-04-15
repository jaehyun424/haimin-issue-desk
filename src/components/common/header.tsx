import Link from "next/link";
import { cn } from "@/lib/utils";

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
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <span
            aria-hidden
            className="gov-seal flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-bold tracking-tight shadow-flat"
          >
            이해민
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">
              이해민 의원실
            </span>
            <span className="text-xs text-muted-foreground">
              과방위 의정 브리프
            </span>
          </span>
        </Link>
        <nav aria-label="주요 메뉴" className="flex items-center gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
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
