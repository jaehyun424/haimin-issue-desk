export const metadata = { title: "개인정보 처리방침" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="kicker">개인정보</p>
        <h1>개인정보 처리방침</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          본 방침은 이해민 의원실이 운영하는 과방위 의정 브리프 웹사이트(이하 "서비스")의
          개인정보 처리 원칙을 설명합니다. 본 방침은 서비스 운영 기준으로 작성되었으며,
          관련 법령 및 운영 환경 변화에 따라 개정될 수 있습니다.
        </p>
      </header>

      <section className="space-y-3">
        <h2>1. 처리하는 개인정보 항목</h2>
        <ul className="list-disc space-y-1 pl-6 text-sm leading-relaxed">
          <li>
            정책 제안 접수: [필수] 의견 내용 · [선택] 이름 또는 닉네임, 이메일
          </li>
          <li>
            자동 수집(서비스 운영용): 접속 시각, 브라우저 정보, IP의 해시 값(원문 IP는
            저장하지 않습니다)
          </li>
          <li>관리자 인증: 이메일, 비밀번호 해시, 역할, 접속 기록</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>2. 수집·이용 목적</h2>
        <ul className="list-disc space-y-1 pl-6 text-sm leading-relaxed">
          <li>의원실의 과방위 정책 참고 자료 수집 및 분석</li>
          <li>후속 연락에 동의한 이용자에 대한 회신</li>
          <li>서비스 운영의 안정성 확보 및 보안</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>3. 보관 기간</h2>
        <ul className="list-disc space-y-1 pl-6 text-sm leading-relaxed">
          <li>무연락 익명 제안: 접수일로부터 180일 후 삭제</li>
          <li>연락처 포함 제안: 후속 연락 종료 후 6개월 보관 뒤 익명화 또는 삭제</li>
          <li>접근 기록·IP 해시 등 보안 로그: 7일 보관 후 파기 또는 집계화</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>4. 제3자 제공</h2>
        <p className="text-sm leading-relaxed">
          원칙적으로 제3자에게 제공하지 않습니다. 법령에 따라 요구되는 경우에만
          제한적으로 제공되며, 그 경우 정보 주체에게 지체 없이 고지합니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2>5. 국외 이전</h2>
        <p className="text-sm leading-relaxed">
          서비스 데이터는 국내 호스팅을 우선합니다. 선택적으로 AI 기반 요약 기능이
          활성화된 경우 최소한의 텍스트가 처리 목적에 한해 외부 사업자(미국)로 전송될 수
          있으며, 해당 이전 사실은 본 방침에 별도로 고지합니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2>6. 정보 주체의 권리</h2>
        <p className="text-sm leading-relaxed">
          정보 주체는 언제든지 본인의 개인정보 열람, 정정·삭제, 처리 정지를 요청할 수
          있습니다. 요청은 아래 개인정보 보호 책임자에게 접수합니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2>7. 개인정보 보호 책임자</h2>
        <p className="text-sm leading-relaxed">
          이해민 의원실 정책 비서관. 문의:{" "}
          <a
            href="mailto:haimin.office@assembly.go.kr"
            className="underline underline-offset-4"
          >
            haimin.office@assembly.go.kr
          </a>{" "}
          <span className="text-muted-foreground">(운영 준비 중)</span>
        </p>
      </section>
    </article>
  );
}
