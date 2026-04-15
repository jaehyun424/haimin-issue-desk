"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

const NAV: NavItem[] = [
  { href: "/brief", label: "브리프" },
  { href: "/brief/activity", label: "의정활동" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ voiceEnabled }: { voiceEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = voiceEnabled ? [...NAV, { href: "/voice", label: "정책 제안" }] : NAV;

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

        {/* 데스크톱 네비 */}
        <nav aria-label="주요 메뉴" className="hidden items-center gap-5 sm:flex">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-1 text-sm transition-colors",
                  active
                    ? "font-semibold text-foreground"
                    : "text-foreground/75 hover:text-foreground",
                )}
              >
                {item.label}
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-primary"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* 모바일 햄버거 */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded border border-border sm:hidden"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="site-mobile-drawer"
        >
          {open ? (
            <X className="h-4 w-4" aria-hidden />
          ) : (
            <Menu className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>

      {/* 모바일 드로어 + 오버레이 */}
      {open ? (
        <>
          <button
            type="button"
            aria-label="메뉴 배경 닫기"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-foreground/40 sm:hidden"
          />
          <div
            id="site-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="주요 메뉴"
            className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background pt-safe sm:hidden"
          >
            <div className="gov-strip" aria-hidden />
            <div className="container flex h-14 items-center justify-between">
              <span className="text-[15px] font-semibold tracking-tight text-foreground">
                이해민 의원실
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded border border-border"
                aria-label="메뉴 닫기"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <nav aria-label="모바일 주요 메뉴" className="container pb-6 pt-2">
              <ul className="divide-y divide-border">
                {items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "block py-3 text-[17px]",
                          active
                            ? "font-semibold text-foreground"
                            : "text-foreground/80 hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
