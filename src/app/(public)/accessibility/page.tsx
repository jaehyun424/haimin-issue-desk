export const metadata = { title: "접근성 안내" };

export default function AccessibilityPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">접근성 안내</h1>
      <p className="text-sm text-muted-foreground">
        이 서비스는 한국형 웹 콘텐츠 접근성 지침(KWCAG) 2.2 준수를 목표로 설계되었습니다.
      </p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">디자인 원칙</h2>
        <ul className="list-disc space-y-1 pl-6 text-sm">
          <li>본문 기본 글자 크기 17px, 브라우저 배율 200%까지 가로 스크롤 없음</li>
          <li>전경과 배경의 명암비 4.5:1 이상</li>
          <li>키보드만으로 모든 핵심 기능을 이용할 수 있도록 설계</li>
          <li>모든 이미지에 대체 텍스트 제공</li>
          <li>스크린리더 사용을 고려한 시맨틱 HTML 구조</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">지원 환경</h2>
        <ul className="list-disc space-y-1 pl-6 text-sm">
          <li>데스크톱: 최신 Chrome, Safari, Firefox, Edge</li>
          <li>모바일: iOS 16+ Safari, Android 10+ Chrome</li>
          <li>스크린리더: NVDA, VoiceOver 기준 검증</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">개선 요청</h2>
        <p className="text-sm">
          접근성 관련 불편을 겪으신 경우 의원실 공식 이메일로 알려 주시면 검토 후 개선합니다.
        </p>
      </section>
    </article>
  );
}
