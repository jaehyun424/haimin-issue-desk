import Link from "next/link";

const LINKS = [
  { href: "/privacy", label: "개인정보 처리방침" },
  { href: "/terms", label: "이용안내" },
  { href: "/source-policy", label: "출처·갱신 정책" },
  { href: "/accessibility", label: "접근성 안내" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="container flex flex-col gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-medium text-foreground">이해민 의원실 과방위 의정 브리프</p>
          <p>
            이 사이트는 이해민 의원실이 과방위 관련 의정활동을 정리·공개하는 업무 도구입니다.
          </p>
        </div>
        <nav aria-label="정책 메뉴" className="flex flex-wrap gap-x-4 gap-y-2">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
