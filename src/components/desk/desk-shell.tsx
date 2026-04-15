"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { DeskSidebar } from "./sidebar";

/**
 * Desk 레이아웃 쉘.
 *
 * - 데스크톱(>= md): 사이드바가 좌측에 고정. 상단바 없음.
 * - 모바일(< md): 사이드바는 기본 숨김. 상단바 햄버거로 드로어 형태로 열림.
 *   드로어 열린 상태에서 라우트가 바뀌면 자동으로 닫힌다.
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

  // 드로어 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 모바일 상단 바 */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background px-4 md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded border border-border text-foreground"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
        >
          {open ? <Menu className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
        </button>
        <span className="text-sm font-semibold">이해민 의원실 Desk</span>
      </div>

      <div className="flex">
        {/* 데스크톱 고정 사이드바 */}
        <div className="hidden md:block">
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
              role="dialog"
              aria-modal="true"
              aria-label="Desk 메뉴"
              className="fixed inset-y-0 left-0 z-50 w-60 md:hidden"
            >
              <div className="relative h-full">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute right-2 top-3 inline-flex h-8 w-8 items-center justify-center rounded border border-border bg-card text-foreground"
                  aria-label="메뉴 닫기"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
                <DeskSidebar
                  voiceEnabled={voiceEnabled}
                  userLabel={userLabel}
                  roleLabel={roleLabel}
                  onNavigate={() => setOpen(false)}
                />
              </div>
            </div>
          </>
        ) : null}

        {/* 메인 */}
        <main id="main" className="min-w-0 flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
