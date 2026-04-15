"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { DeskSidebar } from "./sidebar";

/**
 * Desk 레이아웃 쉘.
 *
 * - 데스크톱(>= md): 사이드바는 sticky + h-dvh 로 페이지 스크롤에 고정.
 * - 모바일(< md): 상단바 햄버거로 드로어 열림/닫힘. 라우트 변경 시 자동 닫힘.
 */
export function DeskShell({
  children,
  voiceEnabled,
  userLabel,
  roleLabel,
}: {
  children: React.ReactNode;
  voiceEnabled: boolean;
  userLabel: string;
  roleLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // 라우트 변경 시 드로어 자동 닫기
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 드로어 열릴 때 body 스크롤 잠금 + ESC 로 닫기
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="min-h-dvh bg-muted/20">
      {/* 모바일 상단 바 — 햄버거 + 타이틀. 심플하게. */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background px-4 md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded border border-border text-foreground"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="desk-mobile-drawer"
        >
          {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
        </button>
        <span className="text-sm font-semibold text-foreground">이슈 데스크</span>
        <span className="w-9" aria-hidden />
      </div>

      <div className="flex">
        {/* 데스크톱: sticky 사이드바 */}
        <div className="sticky top-0 hidden h-dvh shrink-0 md:block">
          <DeskSidebar
            voiceEnabled={voiceEnabled}
            userLabel={userLabel}
            roleLabel={roleLabel}
          />
        </div>

        {/* 모바일 드로어 + 오버레이 */}
        {open ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-foreground/40 md:hidden"
              aria-label="메뉴 배경 닫기"
              onClick={() => setOpen(false)}
            />
            <div
              id="desk-mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="이슈 데스크 메뉴"
              className="fixed inset-y-0 left-0 z-50 max-w-[85vw] md:hidden"
            >
              <DeskSidebar
                voiceEnabled={voiceEnabled}
                userLabel={userLabel}
                roleLabel={roleLabel}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </>
        ) : null}

        {/* 메인 */}
        <main id="main" className="min-w-0 flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-6xl space-y-6 p-4 pb-safe sm:p-6 sm:pb-safe">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
