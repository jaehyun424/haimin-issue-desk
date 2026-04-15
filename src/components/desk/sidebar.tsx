"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Database,
  ExternalLink,
  FileText,
  Flag,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** 기본 startsWith 매칭. true 이면 exact(===) 만 active. */
  exact?: boolean;
  /** voice 플래그가 true 일 때만 표시 */
  voiceOnly?: boolean;
}

const NAV: Item[] = [
  { href: "/desk", label: "대시보드", icon: LayoutDashboard, exact: true },
  { href: "/desk/issues", label: "이슈", icon: ClipboardList },
  { href: "/desk/sources", label: "수집 문서", icon: Database },
  { href: "/desk/briefs", label: "브리프", icon: FileText },
  { href: "/desk/voice", label: "의견 접수", icon: MessageSquare, voiceOnly: true },
  { href: "/desk/settings", label: "설정", icon: Settings },
];

function isActive(pathname: string, item: Item): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function DeskSidebar({
  voiceEnabled,
  userLabel,
  roleLabel,
  onNavigate,
}: {
  voiceEnabled: boolean;
  userLabel: string;
  roleLabel: string;
  /** 모바일 드로어에서 링크 클릭 시 호출 */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = NAV.filter((i) => (i.voiceOnly ? voiceEnabled : true));

  return (
    <aside className="flex h-dvh w-60 flex-col border-r border-border bg-card">
      {/* 상단 타이틀 */}
      <div className="flex h-14 flex-none items-center gap-2 border-b border-border px-4">
        <Flag className="h-5 w-5 text-primary" aria-hidden />
        <span className="text-sm font-semibold">Desk</span>
      </div>

      {/* 메뉴 */}
      <nav aria-label="Desk 메뉴" className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
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
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 하단 유저 + 홈/로그아웃 */}
      <div className="mt-auto flex-none border-t border-border pb-safe">
        {/* 유저 카드 */}
        <div className="flex items-center gap-2.5 px-3 pb-3 pt-3">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50 text-muted-foreground"
          >
            <User className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{userLabel}</p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </div>

        {/* 아래 구분선 + 두 개의 액션 */}
        <div className="grid grid-cols-2 gap-0 border-t border-border">
          <Link
            href="/"
            onClick={onNavigate}
            className="flex items-center justify-center gap-1.5 border-r border-border py-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            홈으로
          </Link>
          <form action="/api/auth/signout" method="post">
            <input type="hidden" name="callbackUrl" value="/" />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
