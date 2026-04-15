"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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
  const [pendingSignOut, startSignOut] = useTransition();

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

      {/* 하단: 유저 카드 → 홈으로 → 로그아웃 (세로 스택) */}
      <div className="mt-auto flex-none border-t border-border pb-safe">
        {/* 유저 정보 */}
        <div className="flex items-center gap-2.5 px-4 py-3">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50 text-muted-foreground"
          >
            <User className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{userLabel}</p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </div>

        {/* 구분선 + 세로 쌓은 2개 유틸리티 액션 — 본 메뉴보다 무게감 낮춤 */}
        <div className="border-t border-border">
          <Link
            href="/"
            onClick={onNavigate}
            className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            홈으로 돌아가기
          </Link>
          <button
            type="button"
            disabled={pendingSignOut}
            onClick={() =>
              startSignOut(async () => {
                await signOut({ callbackUrl: "/", redirect: true });
              })
            }
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground disabled:opacity-60"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            {pendingSignOut ? "로그아웃 중…" : "로그아웃"}
          </button>
        </div>
      </div>
    </aside>
  );
}
