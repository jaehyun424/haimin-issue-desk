export const metadata = { title: "접근성 안내" };

export default function AccessibilityPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="kicker">접근성 안내</p>
        <h1>접근성 안내</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          본 서비스는 한국형 웹 콘텐츠 접근성 지침(KWCAG) 2.2 준수를 목표로
          설계되었습니다.
        </p>
      </header>

      <section className="space-y-2">
        <h2>디자인 원칙</h2>
        <ul className="list-disc space-y-1 pl-6 text-sm leading-relaxed">
          <li>
            본문 기본 글자 크기 17px, 브라우저 배율 200%까지 가로 스크롤이 발생하지
            않도록 설계했습니다.
          </li>
          <li>전경과 배경의 명암비는 4.5:1 이상을 유지합니다.</li>
          <li>키보드만으로 모든 핵심 기능을 이용할 수 있도록 설계되었습니다.</li>
          <li>모든 이미지에 대체 텍스트를 제공합니다.</li>
          <li>스크린리더 사용을 고려해 시맨틱 HTML 구조로 작성되었습니다.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2>지원 환경</h2>
        <ul className="list-disc space-y-1 pl-6 text-sm leading-relaxed">
          <li>데스크톱: 최신 Chrome, Safari, Firefox, Edge</li>
          <li>모바일: iOS 16 이상 Safari, Android 10 이상 Chrome</li>
          <li>스크린리더: NVDA, VoiceOver 기준 검증</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2>개선 요청</h2>
        <p className="text-sm leading-relaxed">
          접근성 관련 불편을 겪으신 경우{" "}
          <a
            href="mailto:haimin.office@assembly.go.kr"
            className="underline underline-offset-4"
          >
            haimin.office@assembly.go.kr
          </a>
          <span className="text-muted-foreground"> (운영 준비 중)</span> 로 알려 주시면
          검토 후 개선합니다.
        </p>
      </section>
    </article>
  );
}
