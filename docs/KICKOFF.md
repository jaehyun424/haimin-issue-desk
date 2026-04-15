# Claude Code 실행 프롬프트

아래 프롬프트를 VSCode + Claude Code(Opus 4.6, Max mode)에서 그대로 사용하면 된다.

---

당신은 수석 풀스택 엔지니어이자 제품 엔지니어다.

우리는 `haimin-issue-desk`라는 Next.js 기반 웹앱을 개발한다.
이 앱은 이해민 의원실/과방위용 통합 플랫폼이며, 하나의 코드베이스 안에 3개 모듈이 있다.

- `/desk` : 내부 운영용 이슈 데스크 (핵심)
- `/brief` : 공개 의정 브리프
- `/voice` : 정책 제안/현장 의견 접수 (코드상 구현, 초기 배포 OFF)

## 최우선 제품 원칙

1. 이 앱의 본체는 내부 업무 도구다.
2. MVP 우선순위는 `desk -> brief -> voice` 이다.
3. `voice`는 공식 청원/민원 시스템처럼 보이면 안 된다.
4. AI는 선택 사항이다. LLM 키가 없어도 앱 전체가 완전히 작동해야 한다.
5. AI 출력은 절대 자동 발행하지 않는다.
6. 공개 브리프는 reviewer 승인 후에만 발행된다.
7. 공개 댓글, 공개 토론, 공개 업로드는 v1에서 만들지 않는다.
8. 소셜 로그인은 만들지 않는다.
9. 관리자 로그인은 email/password 기반으로 만들고, RBAC를 넣는다.
10. `voice`는 feature flag로 OFF 가능한 구조여야 한다.
11. 모든 중요한 관리자 액션은 audit log에 남긴다.
12. 의원 코드(MONA_CD) 같은 외부 식별자는 하드코딩하지 않는다.
13. 디자인은 KRDS 감성과 공공 신뢰성을 참고하되, 구현은 Tailwind + shadcn/ui로 한다.
14. 기본 본문 텍스트는 17px 기준으로 설계한다.
15. 모바일 우선, 접근성 우선이다.

## 기술 스택

- Next.js 15
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui
- PostgreSQL 16
- Drizzle ORM
- Zod
- Auth.js (credentials auth)
- Recharts

## 라우트 구조

- `/`
- `/brief`
- `/brief/issues`
- `/brief/issues/[slug]`
- `/brief/activity`
- `/voice`
- `/privacy`
- `/terms`
- `/source-policy`
- `/accessibility`
- `/desk`
- `/desk/login`
- `/desk/issues`
- `/desk/issues/[id]`
- `/desk/sources`
- `/desk/briefs`
- `/desk/voice`
- `/desk/settings`

## 데이터 모델 요구사항

반드시 다음 테이블을 만든다.

- users
- issues
- issue_categories
- source_documents
- issue_source_links
- briefs
- member_activities
- voice_submissions
- audit_logs
- feature_flags

세부 컬럼은 아래 원칙을 지킨다.

### users
- email unique
- password_hash
- role: admin/editor/reviewer/viewer
- is_active
- last_login_at

### issues
- slug unique
- title
- summary
- status: new/reviewing/tracked/ready_to_publish/published/archived
- priority: low/medium/high/critical
- primary_category_id
- owner_user_id nullable

### source_documents
- source_type
- source_name
- external_id nullable
- url nullable
- title
- body_text nullable
- published_at nullable
- fetched_at
- hash unique-ish
- metadata_json

### briefs
- issue_id
- slug unique
- title
- summary
- body_md
- status: draft/review/published/archived
- published_at nullable
- last_verified_at nullable
- reviewer_user_id nullable

### member_activities
- activity_type: bill/vote/schedule/speech/office_action/press
- occurred_at
- title
- summary nullable
- official_source_url nullable
- metadata_json

### voice_submissions
- type
- display_name nullable
- email nullable
- body
- consent_required
- consent_optional_contact
- status: new/screened/closed
- assigned_user_id nullable

### audit_logs
- actor_user_id nullable
- action
- target_type
- target_id nullable
- payload_json nullable

### feature_flags
- key unique
- enabled boolean
- description nullable

## 카테고리 seed

초기 카테고리는 아래 11개를 seed한다.

1. AI·데이터·고영향 AI
2. 데이터센터·AIDC·전력·PPA
3. 사이버보안·침해사고·정보보호
4. 통신·이동통신·망 이용
5. 방송·미디어·플랫폼 규제
6. OTT·콘텐츠·저작권
7. 반도체·국가전략기술
8. 우주·과학기술·연구인프라
9. R&D 예산·거버넌스
10. 개인정보·디지털권리·딥페이크
11. 규제기관·법안소위·과방위 운영

## 기능 요구사항

### 1단계: 스캐폴딩
- 프로젝트 생성
- 폴더 구조 정리
- 공통 레이아웃
- public/desk 레이아웃 분리
- env.example 작성
- README 작성

### 2단계: 인증/RBAC
- `/desk/login`
- credentials auth
- seeded admin/editor 계정
- role middleware
- protected routes

### 3단계: Desk
- 이슈 목록/검색/필터
- 이슈 생성/수정/삭제
- 소스 문서 목록
- 소스 상세
- 브리프 작성기(md 기반)
- 브리프 상태 전환
- publish action
- audit log 자동 기록

### 4단계: Public Brief
- 홈
- 브리프 목록
- 브리프 상세
- activity timeline
- last updated 표시
- source count 표시

### 5단계: Feature flag / Voice
- feature_flags 기반 조건부 노출
- `voice` OFF 시 404 또는 비노출 처리
- `voice` ON 시 정책 제안 폼
- 제출 유형 4종
- 익명/가명 기본
- 이름/이메일 선택 입력
- 첨부파일 없음

### 6단계: 보안/운영
- Turnstile integration stub
- rate limit abstraction
- source policy page
- privacy page scaffold
- terms page scaffold
- accessibility page scaffold
- election_mode flag

## 품질 기준

- TypeScript strict mode
- ESLint / Prettier
- reusable server-side schema validation with Zod
- no `any` 남발 금지
- loading/error/empty 상태 구현
- semantic HTML
- mobile-first responsive
- Korean copy 우선

## 구현 세부 원칙

- 검색은 PostgreSQL full text search와 trigram으로 시작한다.
- Elasticsearch는 넣지 않는다.
- 파일 업로드는 만들지 않는다.
- public comment system은 만들지 않는다.
- ranking/score system은 만들지 않는다.
- AI runtime은 interface만 만들고 기본값은 disabled로 둔다.
- `voice` 내용은 공개하지 않는다.
- `voice`를 공식 청원처럼 보이게 하는 문구를 쓰지 않는다.
- 브리프 발행 시 source가 1개 이상 연결되지 않으면 발행 불가 처리한다.
- 하드코딩된 의원 코드에 의존하지 않는 구조로 설계한다.

## 문구 정책

- 전체 UI는 한국어로 작성한다.
- 정치적 과장 문구 금지.
- 사실 중심 카피 사용.
- `voice` 페이지에 반드시 다음 취지의 안내문을 둔다:
  - 공식 청원/민원 시스템이 아님
  - 이해민 의원실이 참고를 위해 검토하는 정책 제안 창구임

## 원하는 작업 방식

1. 먼저 전체 repo 구조를 설계해라.
2. 다음으로 DB schema와 migrations를 작성해라.
3. 그 다음 인증/RBAC를 구현해라.
4. 그 다음 `/desk` 핵심 CRUD를 구현해라.
5. 그 다음 `/brief` 공개 레이어를 구현해라.
6. 마지막으로 `voice`를 OFF 상태 기준으로 구현해라.

각 단계마다:
- 생성한 파일 목록
- 왜 그렇게 설계했는지 3~6줄 설명
- 다음 단계 제안
을 남겨라.

## 첫 번째 출력에서 바로 해줘야 하는 것

- 전체 폴더 구조 제안
- `package.json` 핵심 의존성 목록
- `drizzle` 스키마 초안
- `app` 라우트 구조
- `components` 구조
- `lib` 구조
- `feature flag` 구조
- seed 전략
- `.env.example` 항목

그리고 바로 코드 생성을 시작해라.

---

이 프롬프트의 목적은 토론이 아니라 **실제 구현 착수**다.
애매한 것이 있으면 다음 원칙으로 스스로 결정해라:
- 범위를 줄여서라도 shipping 가능한 구조 선택
- 개인정보 범위를 줄이는 선택 우선
- public보다 internal workflow를 우선
- 자동화보다 검수 가능성을 우선
