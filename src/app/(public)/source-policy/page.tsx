export const metadata = { title: "출처·갱신 정책" };

export default function SourcePolicyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">출처·갱신 정책</h1>
      <p className="text-sm text-muted-foreground">
        이 서비스가 정보를 수집·정리·공개하는 기준입니다.
      </p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. 출처 우선순위</h2>
        <ol className="list-decimal space-y-1 pl-6 text-sm">
          <li>국회/정부 공식 데이터 (열린국회정보, 국회사무처, 과기정통부 등)</li>
          <li>국회 유관기관 보고서 (예정처·입법조사처·법률도서관)</li>
          <li>공공기관/전문기관 자료 (KISA 등)</li>
          <li>주요 언론 기사</li>
          <li>기타 참고자료</li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. 수집 주기</h2>
        <ul className="list-disc space-y-1 pl-6 text-sm">
          <li>뉴스/API/RSS: 30분 주기 자동 갱신</li>
          <li>국회 일정/표결/발의안: 1일 4회 + 수동 동기화</li>
          <li>회의록/발언 데이터: 1일 1회 + 수동 동기화</li>
          <li>모든 소스는 마지막 동기화 시각(`last_synced_at`)을 기록합니다.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. 편집 원칙</h2>
        <ul className="list-disc space-y-1 pl-6 text-sm">
          <li>자극적·단정적 수사 금지. 사실관계 중심으로 작성합니다.</li>
          <li>출처 없이 발행하지 않습니다. 브리프는 최소 1개 이상의 출처가 연결돼야 합니다.</li>
          <li>오기·사실관계 변경 시 마지막 검증 시각을 갱신합니다.</li>
          <li>편집자와 검토자는 별도의 역할이며, 같은 사람이 동시에 수행하지 않는 것을 권장합니다.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. 저작권</h2>
        <p className="text-sm">
          외부 기사·자료 전문을 공개하지 않으며, 제목·요약·링크·수집시각만 저장·표시합니다. 원본의
          저작권은 해당 매체에 귀속됩니다.
        </p>
      </section>
    </article>
  );
}
