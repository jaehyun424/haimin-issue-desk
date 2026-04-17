# Known Gaps — haimin-issue-desk

이 문서는 현재 공개 상태에서 **기능적으로는 동작하나 외부 확인·협업·시간이
필요해 남아있는 간극**을 정리한다. 의원실/개발자 공통 참조.

최종 업데이트: 2026-04-17

## 🟠 의원실 협업 필요

### G-1. 의원실 공식 이메일 실수신 검증
- 주소: `haimin.office@assembly.go.kr`
- 현황: 코드 내 모든 문구·링크는 이 주소로 통일됨 (MEMBER SSOT).
- 필요: 의원실 측에서 실제 수신 가능한지 테스트 메일 1회 확인.
- 영향: 미검증 상태에서 시민이 정정 요청 보내면 응답 지연 리스크.

### G-2. 의정활동 타임라인 공식 출처 URL 치환
- 현황: 10건 중 다수가 언론 링크 (zdnet, edaily, etoday 등).
- 필요: 각 활동의 의안번호/회의록 번호 확보 후
  assembly.go.kr, likms.assembly.go.kr, open.assembly.go.kr 로 치환.
- 추측 교체 금지 — 의원실이 의안번호 제공해야 가능.
- DB 필드: `member_activities.officialSourceUrl`,
  `metadata_json->>'needsOfficialUrl'`.

### G-3. activity_type 재분류 검토
- 후보: `AI 데이터센터 특별법 과방위 의결` → 현재 `schedule` (위원회 일정).
  실제 의미는 "위원회 의결" 또는 "상임위 활동" 에 가까움.
- 필요: 의원실 확인 후 enum 변경 또는 재분류.

### G-4. (대체) 브리프 본문 정기 한국어 교열 정책
- 현황: 4개 발행 브리프 bodyMd 현재 명백한 띄어쓰기 오류 없음
  (2026-04-17 최종 검토 확인).
- 필요: 향후 신규 브리프 추가 시 동일 수준의 교열 게이트 유지.
- 해결: 편집자가 Markdown 에디터에서 1차 검토, 검토자가 발행
  직전 재검토. 자동화는 선택 — GitHub Action 에서 특정 패턴
  체크(`[가-힣]+ [와과를을이가은는]`) 를 경고로만 표시.
- 영향: 현재 없음, 미래 품질 유지용.

## 🟡 코드/운영 개선 (다음 라운드)

### G-5. issue_category_links 복합 Primary Key 누락
- 파일: src/lib/db/schema/issues.ts (line 31~39)
- 현황: PK/UNIQUE 없음 → 중복 행 방지 불가.
- 해결: (issueId, categoryId) composite PK 마이그레이션 추가.
- 영향: 현재 0 rows 라 실질 영향 없음, 향후 데이터 쌓이면 필수.

### G-6. Rate limit 인메모리 → Upstash/KV
- 파일: src/lib/rate-limit/index.ts
- 현황: `const store = new Map()` — 프로세스 로컬.
- 문제: Vercel Serverless 다중 인스턴스에서 bucket 분리 → 실효 rate limit 희석.
- 해결: `RATE_LIMIT_BACKEND=redis` 분기 구현 (현재 구조는 준비됨).
- 영향: 트래픽 증가 시 우선순위 상승.

### G-7. depcheck 의심 의존성 8개 정리
- 후보: @hookform/resolvers, react-hook-form, recharts, slugify,
  @radix-ui/react-{dialog,dropdown-menu,tabs,toast}.
- 해결: 실제 import 여부 확인 후 unused 제거.
- 영향: 번들 사이즈 감소.

### G-8. 로그인 성공 감사 로그 자동 테스트 부재
- 현황: `auth.login` 이벤트가 auditLogs 에 기록되지만 vitest 없음.
- 해결: `src/lib/auth/index.test.ts` 에 로그인 성공/실패 시나리오 테스트 추가.

### G-9. 개별 브리프 OG 이미지 미구현
- 현황: 루트 `opengraph-image.tsx` 고정 3줄 텍스트만. 브리프별 제목 미반영.
- 해결: `src/app/(public)/brief/issues/[slug]/opengraph-image.tsx` 신규.
- 영향: SNS 공유 품질 개선.

### G-10. NEXT_PUBLIC_APP_URL Production env 명시 필요
- 현황: 미설정 시 sitemap/robots 가 vercel.app 도메인으로 폴백.
- 해결: Vercel Production env 에 명시적 세팅.
- 영향: 커스텀 도메인 전환 시 필수.

### G-11. voice 서버 액션 audit action 타입 불일치
- 파일: src/app/(public)/voice/actions.ts
- 현황: 제출 최초 생성인데 `action: "voice.update_status"` 로 기록.
- 해결: `AuditAction` union 에 `"voice.submit"` 추가 후 교체.

### G-12. 로그아웃 감사 로그 미기록
- 현황: `"auth.logout"` 타입 선언만 있고 실제 기록 코드 부재.
- 해결: signOut 직전 서버 액션으로 writeAudit 호출.

## 🔵 공개 운영 정책 (경영 판단 필요)

### G-13. 공개/데모 경계 — 커스텀 도메인 전환
- 현황: 현재 URL `haimin-issue-desk.vercel.app` 는
  NEXT_PUBLIC_DEMO_MODE=true 상태 (푸터 관리자 링크 + 자동 입력).
- 필요: 공식 커스텀 도메인(예: `.kr`) 준비 후:
  - Production: NEXT_PUBLIC_DEMO_MODE=false (순수 공개본)
  - Staging/Preview: NEXT_PUBLIC_DEMO_MODE=true (시연용)
- 영향: 외부 공개 확산 시점에 결정.
