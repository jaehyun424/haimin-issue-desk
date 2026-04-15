export const metadata = { title: "이용안내" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="kicker">이용안내</p>
        <h1>이용안내</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          본 사이트는 이해민 의원실이 운영하는 과방위 의정 브리프 웹사이트입니다.
          이용자는 아래 사항을 확인해 주세요.
        </p>
      </header>

      <section className="space-y-2">
        <h2>서비스 성격</h2>
        <ul className="list-disc space-y-1 pl-6 text-sm leading-relaxed">
          <li>본 사이트는 국회 공식 청원 또는 민원 시스템이 아닙니다.</li>
          <li>공개 브리프는 편집자·검토자의 확인을 거친 뒤 발행됩니다.</li>
          <li>게시된 정보는 발행 시점의 자료에 기반하며, 이후 변동될 수 있습니다.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2>인용 · 재사용</h2>
        <p className="text-sm leading-relaxed">
          본 사이트의 원저작물(브리프, 타임라인 등)은 출처 표시와 함께 비상업적 목적에
          한해 자유롭게 인용할 수 있습니다. 외부 기사·보도자료의 경우 원저작자의 이용
          조건을 따라야 합니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2>문의</h2>
        <p className="text-sm leading-relaxed">
          오기·사실관계 정정 요청은{" "}
          <a
            href="mailto:haimin.office@assembly.go.kr"
            className="underline underline-offset-4"
          >
            haimin.office@assembly.go.kr
          </a>
          로 접수합니다.
        </p>
      </section>
    </article>
  );
}
