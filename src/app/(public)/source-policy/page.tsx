export const metadata = { title: "출처·갱신 정책" };

export default function SourcePolicyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="kicker">출처·갱신 정책</p>
        <h1>출처·갱신 정책</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          본 서비스가 정보를 수집·정리·공개하는 기준입니다.
        </p>
      </header>

      <section className="space-y-2">
        <h2>1. 출처 우선순위</h2>
        <ol className="list-decimal space-y-1 pl-6 text-sm leading-relaxed">
          <li>국회·정부 공식 데이터 (열린국회정보, 국회사무처, 과기정통부 등)</li>
          <li>국회 유관기관 보고서 (국회예산정책처·국회입법조사처·국회법률도서관)</li>
          <li>공공기관·전문기관 자료 (KISA 등)</li>
          <li>주요 언론 기사</li>
          <li>기타 참고자료</li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2>2. 수집 주기</h2>
        <ul className="list-disc space-y-1 pl-6 text-sm leading-relaxed">
          <li>뉴스·API·RSS: 정기적으로 자동 동기화</li>
          <li>국회 일정·표결·발의안: 정기적 자동 동기화 및 수동 동기화</li>
          <li>회의록·발언 데이터: 정기적 자동 동기화 및 수동 동기화</li>
          <li>모든 소스는 마지막 동기화 시각을 기록합니다.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2>3. 편집 원칙</h2>
        <ul className="list-disc space-y-1 pl-6 text-sm leading-relaxed">
          <li>자극적·단정적 수사를 사용하지 않고 사실관계 중심으로 작성합니다.</li>
          <li>
            출처 없이 발행하지 않습니다. 공개 브리프는 최소 1건 이상의 출처를 연결해야
            합니다.
          </li>
          <li>오기·사실관계 변경 시 마지막 검증 시각을 갱신합니다.</li>
          <li>
            편집자와 검토자는 분리된 역할이며, 동일인이 동시에 수행하지 않는 것을
            권장합니다.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2>4. 저작권</h2>
        <p className="text-sm leading-relaxed">
          외부 기사·자료 전문을 공개하지 않으며, 제목·요약·링크·수집 시각만 저장하고
          표시합니다. 원본의 저작권은 해당 매체에 귀속됩니다.
        </p>
      </section>
    </article>
  );
}
