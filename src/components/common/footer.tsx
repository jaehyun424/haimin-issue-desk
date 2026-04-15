import Link from "next/link";

const LINKS = [
  { href: "/privacy", label: "개인정보 처리방침" },
  { href: "/terms", label: "이용안내" },
  { href: "/source-policy", label: "출처·갱신 정책" },
  { href: "/accessibility", label: "접근성 안내" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-muted/30">
      <div className="container py-10">
        <div className="grid gap-8 sm:grid-cols-[1.3fr_1fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="gov-seal flex h-7 w-7 items-center justify-center rounded-md text-[9px] font-bold tracking-tight">
                이해민
              </span>
              <p className="text-sm font-semibold text-foreground">
                이해민 의원실 과방위 의정 브리프
              </p>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              이 사이트는 이해민 의원실이 과학기술정보방송통신위원회 관련 의정활동을
              정리·공개하는 업무 도구입니다. 공개 브리프는 편집자·검토자의 확인을 거친
              뒤 발행되며, 공식 출처 링크와 마지막 검증 시각을 함께 표기합니다.
            </p>
          </div>
          <nav aria-label="정책 메뉴" className="flex flex-col gap-2 text-sm sm:items-end">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          © 이해민 의원실. 공공 의정 정보 기반의 업무 참고 자료이며, 법적 효력을 가진
          공식 공지는 국회 및 각 부처의 공식 채널을 통해 확인해 주세요.
        </div>
      </div>
    </footer>
  );
}
