"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Database,
  FileText,
  Flag,
  LayoutDashboard,
  MessageSquare,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  voiceOnly?: boolean;
}

const NAV: Item[] = [
  { href: "/desk", label: "대시보드", icon: LayoutDashboard },
  { href: "/desk/issues", label: "이슈", icon: ClipboardList },
  { href: "/desk/sources", label: "수집 문서", icon: Database },
  { href: "/desk/briefs", label: "브리프", icon: FileText },
  { href: "/desk/voice", label: "의견 접수", icon: MessageSquare, voiceOnly: true },
  { href: "/desk/settings", label: "설정", icon: Settings },
];

export function DeskSidebar({
  voiceEnabled,
  userLabel,
  roleLabel,
  onNavigate,
}: {
  voiceEnabled: boolean;
  userLabel: string;
  roleLabel: string;
  /** 링크 클릭 시 호출 (모바일 드로어를 닫기 위해 사용) */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Flag className="h-5 w-5 text-primary" aria-hidden />
        <span className="text-sm font-semibold">Desk</span>
      </div>
      <nav aria-label="Desk 메뉴" className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV.filter((i) => (i.voiceOnly ? voiceEnabled : true)).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3 text-xs text-muted-foreground">
        <div className="truncate font-medium text-foreground">{userLabel}</div>
        <div>{roleLabel}</div>
        <form action="/api/auth/signout" method="post" className="mt-2">
          <input type="hidden" name="callbackUrl" value="/desk/login" />
          <button
            type="submit"
            className="text-xs underline underline-offset-2 hover:text-foreground"
          >
            로그아웃
          </button>
        </form>
      </div>
    </aside>
  );
}
