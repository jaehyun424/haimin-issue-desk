# 이해민 의원실 통합 웹 플랫폼 — PRD v1.0 (Final)

> **문서 버전**: 1.0 — 개발 착수용 최종 확정본
> **작성일**: 2026-04-15
> **목적**: Claude Code (Opus 4.6 Max) 개발 착수를 위한 단일 기획 문서
> **대상 사용자**: 이해민 의원실 (과학기술정보방송통신위원회, 조국혁신당 비례대표)
> **1차 사용자**: 비서관 하우준 (내부 운영)
> **2차 사용자**: 일반 시민 (공개 페이지)

---

## 1. 제품 정의

### 1.1 한 줄 정의

**이해민 의원실의 과방위 업무를 구조화하고, 의정활동을 시민에게 보여주고, 정책 의견을 수렴하는 통합 웹 플랫폼.**

### 1.2 제품 구조 — "하나의 제품군, 세 개의 표면"

```
┌─────────────────────────────────────────────────────┐
│                  공유 인프라 레이어                      │
│  하나의 DB · 하나의 인증 · 하나의 관리자 시스템            │
├─────────────┬──────────────────┬────────────────────┤
│   /desk     │    /activity     │      /voice        │
│ 내부 이슈   │  공개 의정활동    │  정책 의견 접수     │
│  데스크     │  브리프/타임라인   │                    │
│ (비공개)    │    (공개)         │     (공개)         │
└─────────────┴──────────────────┴────────────────────┘
```

### 1.3 MVP 우선순위 — 확정

| 순위 | 모듈 | 이유 |
|------|------|------|
| **1순위** | `/desk` 내부 이슈 데스크 | 우준이의 시간을 직접 줄여줌. 공개 모듈의 공통 데이터 기반. 국회AI의정지원플랫폼과 충돌 없음 |
| **2순위** | `/activity` 의정활동 브리프 | 국회 공개데이터로 자동화 가능 영역 큼. 의원님 홍보/설명에 즉시 활용 가능 |
| **3순위** | `/voice` 정책 의견 접수 | 내부 triage 체계가 준비된 후에 열어야 함. 스팸·민원·개인정보 리스크를 Desk가 흡수한 뒤 오픈 |

### 1.4 이 제품이 아닌 것 — 확정

- 국회 공식 청원/민원 시스템이 아님
- 범용 국회 자료 검색/AI 분석 도구가 아님 (국회AI의정지원플랫폼 영역)
- 선거 캠페인 도구가 아님
- 다른 의원실에 범용으로 적용되는 SaaS가 아님 (v1 기준)

---

## 2. 최종 결정 사항 — 애매한 것 전부 확정

### 2.1 통합 vs 분리 — 확정: 분리 개발 반대, 분리 노출 찬성

- **코드베이스**: 1개 (monorepo 아님, 단일 Next.js 프로젝트)
- **DB**: 1개 (PostgreSQL)
- **배포**: 1개 (Vercel, 커스텀 도메인)
- **관리자 시스템**: 1개
- **사용자 표면**: 3개 (라우트 기반 분리: `/desk`, `/activity`, `/voice`)

### 2.2 기술 스택 — 확정

| 레이어 | 선택 | 근거 |
|--------|------|------|
| **프레임워크** | Next.js 15 (App Router) + TypeScript | 재현 기존 스택, SSR/SSG 하이브리드 |
| **스타일링** | Tailwind CSS v4 | 재현 기존 스택 |
| **DB** | Supabase (PostgreSQL + Auth + Storage) | 무료 티어 충분, 재현 기존 경험, 한국 리전 없지만 Singapore 리전 사용 |
| **인증** | Supabase Auth (이메일/비밀번호 — 관리자용) | 소셜 로그인은 v1에서 제외 (아래 결정 참조) |
| **배포** | Vercel (Seoul 리전 `icn1` 설정 필수) + 커스텀 도메인 | vercel.app 도메인 ISP 차단 이슈 있으므로 반드시 커스텀 도메인 |
| **뉴스 수집** | Naver News Search API + Google News RSS + 정부 RSS | BIGKinds MOU 불확실 → v1 제외 |
| **AI 요약** | Claude API (Sonnet) | 재현 기존 구독, 한국어 품질 검증됨 |
| **스팸 방지** | Cloudflare Turnstile (무료) | 이미지 퍼즐 없음, 고령 사용자 친화 |
| **차트/시각화** | Recharts | React 네이티브, 가벼움 |

### 2.3 소셜 로그인 — 확정: v1에서 제외

**이유:**
1. 의견 접수에 카카오/네이버 로그인 → 개인정보 수집 범위 불필요하게 확대
2. 정치적 의견 + 소셜 계정 연결 → 개인정보보호법 제23조 민감정보 이슈 발생
3. 네이버 로그인 검수 과정 필요 → MVP 속도 저하
4. GPT 의견 일치: "UX를 무겁게 만들 수 있다"

**대안:**
- `/desk` 관리자: Supabase Auth 이메일/비밀번호 (초대 기반)
- `/voice` 시민: 익명 제출 기본, 연락처는 선택 입력
- `/activity`: 인증 불필요 (공개 페이지)

### 2.4 "국회 과방위에 바란다" 이름 — 확정: 변경

**변경 전**: 국회 과방위에 바란다
**변경 후**: **과방위 정책 의견 접수** (또는 "이해민 의원실 과방위 현안 의견 접수")

**이유**: "바란다"는 공식 청원처럼 들림. 국회 청원은 국회법 특별체계 적용, 국민동의청원은 5만명 서명 필요. 혼동 위험.

**필수 안내문** (페이지 상단 고정):
> 이 페이지는 국회 공식 청원·민원 시스템이 아닙니다.
> 이해민 의원실이 과방위 관련 정책 참고를 위해 운영하는 의견 접수 채널입니다.
> 공식 청원은 [국민동의청원](https://petitions.assembly.go.kr)을, 민원은 [국민신문고](https://epeople.go.kr)를 이용해 주세요.

### 2.5 호스팅 & 데이터 주권 — 확정

- **CSAP 인증**: 의원실 자체 운영 플랫폼에 법적 의무 아님. 다만 CSAP 인증 클라우드 사용은 권장사항
- **Vercel**: CSAP 미인증이지만, 의원실은 공공기관이 아니므로 법적 문제 없음
- **Supabase**: Singapore 리전 사용 → 국외이전 고지 필요 (개인정보처리방침에 명시)
- **커스텀 도메인**: `.kr` 또는 `.com` 확보 필수 (예: `haemindesk.kr` 또는 `haemin-office.kr`)
- **도메인 확보**: 우준이 확인 후 결정 → 개발 중에는 Vercel 프리뷰 URL 사용

### 2.6 국외이전 고지 — 확정: 필요

Supabase(Singapore), Vercel(Seoul+US edge), Claude API(US) 사용 → 개인정보처리방침에 아래 명시:

```
국외이전 항목:
- 이용자 제출 의견 텍스트: AI 요약 처리를 위해 미국 소재 서버로 전송 (Anthropic)
- 서비스 운영 데이터: 싱가포르 소재 서버에 저장 (Supabase/AWS ap-southeast-1)
```

### 2.7 선거 모드 — 확정: 제품에 내장

**2026년 6월 3일 지방선거** 기준, 90일 전 = 약 3월 5일 → **현재 선거기간 제한 구간 진행 중**

제품에 내장할 기능:
- `ELECTION_MODE` 환경변수 (boolean)
- 활성화 시: `/activity` 자동 발행 중지 → 검토 후 수동 발행만 가능
- `/voice` 신규 접수는 계속 가능하되, 공개 표시 불가
- 관리자 대시보드에 선거모드 ON/OFF 토글 + 경고 배너

### 2.8 관리자 권한 체계 — 확정: 3단계

| 역할 | 권한 | 대상 |
|------|------|------|
| **admin** | 전체 관리, 사용자 초대, 설정 변경, 발행 승인 | 하우준 (비서관) |
| **editor** | 이슈 작성/편집, 브리프 초안, 의견 분류 | 의원실 보좌진 |
| **viewer** | 읽기 전용, 대시보드 열람 | 의원님, 기타 참조 인력 |

### 2.9 데이터 보관 기간 — 확정

| 데이터 유형 | 보관 기간 | 근거 |
|------------|----------|------|
| 시민 제출 의견 (원문) | 접수일로부터 2년 | 최소보관 원칙 |
| 시민 연락처 (선택 입력) | 후속 연락 완료 후 6개월 | 목적 달성 후 파기 |
| 내부 이슈/메모 | 국회 임기 종료 후 1년 | 의정활동 기록 보존 |
| 공개 브리프 | 삭제 전까지 영구 | 공개 정보 |
| 수집 뉴스/보도자료 | 수집일로부터 1년 | 저장 공간 관리 |

---

## 3. 모듈별 상세 기능 명세

### 3.1 `/desk` — 내부 이슈 데스크 (1순위)

**목적**: 과방위 현안을 수집·정리·추적하고, 의원실 후속조치를 관리하는 내부 운영 도구.

#### 3.1.1 이슈 관리

```
이슈(Issue) 데이터 모델:
- id: UUID
- title: string (이슈 제목)
- category: enum (아래 11개 카테고리)
- status: enum (수집됨 | 검토중 | 활성 | 대응완료 | 보관)
- priority: enum (긴급 | 높음 | 보통 | 낮음)
- summary: text (AI 요약 또는 수동 작성)
- sources: relation (수집된 뉴스/보도자료 링크)
- related_bills: relation (관련 발의안)
- actions: relation (후속조치 목록)
- notes: text (내부 메모, 비공개)
- created_at, updated_at: timestamp
- created_by: relation (관리자)
- is_public_brief: boolean (공개 브리프 발행 여부)
- brief_content: text (공개용 편집본, is_public_brief=true일 때 /activity에 노출)
- brief_approved_by: relation (발행 승인자)
- brief_approved_at: timestamp
```

#### 3.1.2 과방위 11개 모니터링 카테고리 — 확정

1. **AI 거버넌스** — AI기본법, 고영향AI, 생성형AI, AI영향평가, 딥페이크
2. **AI 인프라** — AIDC특별법, 데이터센터, PPA, GPU확보, 전력수급
3. **사이버보안** — 정보통신망법, 사이버안보기본법, CISO, 침해사고, SKT해킹 후속
4. **통신** — 단통법, 망사용료, 6G, MVNO, 통신비세액공제
5. **방송/미디어** — 방미통위설치법, OTT규제, 자율등급제, 방심위, 공정성심의
6. **플랫폼/전자상거래** — 다크패턴, 플랫폼규제, 전자상거래법
7. **개인정보/정보보호** — 개인정보보호법, 정보보호세액공제, 정보보호수준평가
8. **반도체/산업기술** — 반도체지원, 산업기술유출방지법, 국가전략기술
9. **우주항공** — 우주항공청, 발사체, 위성
10. **R&D 정책** — 과기정통부 예산, K-문샷, 기초연구
11. **기타 과방위** — 위에 해당하지 않는 과방위 소관 사항

#### 3.1.3 자동 수집 파이프라인

```
수집 주기: 매일 2회 (09:00, 18:00 KST) — Vercel Cron Jobs

수집 소스 (확정, 우선순위순):
┌─ Tier 1: 국회/정부 공식 ────────────────────────────────────┐
│ • 열린국회정보 API — 발의법률안, 위원회 일정, 표결현황         │
│ • 과기정통부 RSS — https://www.korea.kr/rss/dept_msit.xml   │
│ • 정책브리핑 RSS — https://www.korea.kr/rss/policy.xml      │
│ • KISA 보안공지 RSS                                         │
│ • data.go.kr 국회 API — 의원정보, 의안정보                    │
└───────────────────────────────────────────────────────────┘
┌─ Tier 2: 유관기관 보고서 ──────────────────────────────────┐
│ • 국회예산정책처(NABO) API — 보고서/간행물                    │
│ • 국회입법조사처(NARS) — 과학방송통신 카테고리                 │
│ • 국회법률도서관 Open API — 최신법령/판례                     │
└───────────────────────────────────────────────────────────┘
┌─ Tier 3: 언론 ─────────────────────────────────────────────┐
│ • Naver News Search API — 카테고리별 키워드 검색             │
│   (25,000 calls/day, 100 results/call)                      │
│ • Google News Korea RSS — 보조 소스                         │
└───────────────────────────────────────────────────────────┘

처리 흐름:
수집 → 중복제거(URL 기준) → 카테고리 자동분류(Claude Sonnet) 
→ 3줄 요약 생성 → 이슈 후보로 등록 → 관리자 검토 대기
```

#### 3.1.4 후속조치 관리

```
후속조치(Action) 데이터 모델:
- id: UUID
- issue_id: relation
- title: string (조치 내용)
- assignee: string (담당자 이름)
- status: enum (할일 | 진행중 | 완료)
- due_date: date (optional)
- notes: text
- created_at, completed_at: timestamp
```

#### 3.1.5 대시보드

- 오늘의 이슈 요약 (AI 생성, 매일 아침)
- 카테고리별 활성 이슈 수
- 미처리 후속조치 목록
- 최근 수집된 뉴스/보도자료 피드
- `/voice` 미분류 의견 수 (Voice 오픈 후)

---

### 3.2 `/activity` — 의정활동 브리프 (2순위)

**목적**: 이해민 의원의 과방위 활동을 시민이 읽기 쉽게 정리한 공개 페이지.

#### 3.2.1 자동 수집 데이터 (API 기반)

이해민 의원 식별: `MONA_CD = 0698755I` (또는 `RST_PROPOSER` 이름 필터)

```
자동 수집 항목:
- 대표발의 법률안 목록 + 진행 상태 (열린국회정보 API)
- 본회의 표결 참여 기록 (의안별 표결현황 API)
- 위원회 회의 일정 (위원회 의사일정 API, COMMITTEE = "과학기술정보방송통신위원회")
- 법률안 상세 (의안정보 통합 API)

수집 주기: 매일 1회 (06:00 KST)
```

#### 3.2.2 수동 입력 데이터 (관리자 작성)

```
수동 입력 항목 (/desk에서 작성 → /activity로 발행):
- 현안별 의원실 입장/코멘트
- 국정감사 주요 발언 요약
- 청문회 활동 요약
- 후속조치 진행 상황
- 의원 공식 성명/입장문
```

**핵심 원칙**: 자동 수집된 정형 데이터 + 관리자 검수된 맥락 데이터 = 공개 브리프. LLM이 자동 생성한 텍스트는 공개 발행 전 반드시 사람 승인 필요.

#### 3.2.3 페이지 구조

```
/activity
├── / (메인) — 최신 활동 타임라인
├── /bills — 발의법률안 목록 + 상태
├── /votes — 표결 참여 기록
├── /issues — 현안별 대응 브리프 (Desk에서 발행된 것)
└── /about — 이해민 의원 소개 (프로필, 경력, 위원회)
```

#### 3.2.4 의원 프로필 데이터 (확정)

```
이해민 (李海旼)
- 생년: 1973년
- 소속: 조국혁신당 (비례대표)
- 위원회: 과학기술정보방송통신위원회
- 주요 경력: Google 시니어 PM (15년+), 오픈서베이 CPO
- 22대 국회 실적 (API 자동 갱신):
  · 대표발의 법률안: ~61건
  · 본회의 출석률: ~100%
  · 위원회 출석률: ~98%
```

---

### 3.3 `/voice` — 정책 의견 접수 (3순위)

**목적**: 시민의 과방위 관련 정책 의견/현장 제보를 구조화하여 접수.

#### 3.3.1 제출 유형 — 확정: 4분기

| 유형 | 설명 | 처리 |
|------|------|------|
| **정책 제안** | 과방위 소관 정책에 대한 의견/아이디어 | 내부 검토 → 이슈 연결 |
| **현장 제보** | 산업/기술 현장의 문제점 제보 | 내부 검토 → 이슈 연결 |
| **개인 민원** | 개인적 피해/불만 | 자동 안내: 국민신문고/의원실 직접 연락 안내 |
| **제휴/취재 요청** | 언론/단체/기관 연락 | 의원실 공식 이메일로 리다이렉트 |

#### 3.3.2 폼 필드 — 확정

```
필수 입력:
- 제출 유형: radio (정책 제안 / 현장 제보)
- 관련 분야: select (11개 카테고리에서 선택)
- 제목: text (최대 100자)
- 내용: textarea (최대 3000자)
- 개인정보 수집·이용 동의: checkbox (필수)

선택 입력:
- 이름 또는 닉네임: text
- 연락처 (이메일 또는 전화): text
- 후속 연락 수신 동의: checkbox (선택)
- 소속/직업: text
- 첨부파일: file (이미지/PDF, 최대 5MB, 최대 3개)

수집하지 않는 정보 (v1):
- 주소, 생년월일, 주민등록번호, CI, 성별
- 소셜 로그인 계정 정보
```

#### 3.3.3 개인정보 처리 — 확정

```
수집 목적: 이해민 의원실 과방위 정책 참고 자료 수집
수집 항목: [필수] 의견 내용 / [선택] 이름, 연락처, 소속
보관 기간: 접수일로부터 2년 (연락처는 후속 연락 완료 후 6개월)
동의 거부 권리: 필수 항목 미동의 시 접수 불가, 선택 항목 미동의 시 불이익 없음

⚠ 민감정보 회피 설계:
- 의견은 기본적으로 "익명" 접수 (이름/연락처 선택)
- 소셜 로그인 미사용 → 정치적 견해 + 개인 식별 연결 최소화
- 제출된 의견은 초기에 전부 비공개 수집 → 공개 여부는 관리자 판단
- "정치적 견해" 민감정보 별도 동의 트리거 회피
```

#### 3.3.4 스팸 방지 — 확정

```
Layer 1: Cloudflare Turnstile (프론트엔드, 무료)
Layer 2: Rate Limiting — IP당 5회/시간 (@upstash/ratelimit + Upstash Redis 무료 티어)
Layer 3: 서버사이드 텍스트 검증 — 최소 글자수(20자), 금칙어 필터
Layer 4: 관리자 수동 검토 큐 (모든 제출은 "미분류" 상태로 시작)
```

---

## 4. 데이터 모델 (확정)

```sql
-- 사용자 (관리자만)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT now()
)

-- 이슈 (Desk 핵심)
issues (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  category ENUM(11개 카테고리) NOT NULL,
  status ENUM('collected', 'reviewing', 'active', 'resolved', 'archived') DEFAULT 'collected',
  priority ENUM('urgent', 'high', 'normal', 'low') DEFAULT 'normal',
  summary TEXT,
  notes TEXT, -- 내부 메모
  is_public_brief BOOLEAN DEFAULT FALSE,
  brief_content TEXT, -- 공개용 편집본
  brief_approved_by UUID REFERENCES users(id),
  brief_approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- 수집 소스 (뉴스/보도자료)
collected_sources (
  id UUID PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  source_name TEXT, -- "네이버뉴스", "과기정통부", "KISA" 등
  source_tier ENUM('official', 'institution', 'media') NOT NULL,
  category ENUM(11개 카테고리),
  ai_summary TEXT,
  collected_at TIMESTAMPTZ DEFAULT now(),
  issue_id UUID REFERENCES issues(id) -- nullable, 이슈 연결 전
)

-- 후속조치
actions (
  id UUID PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) NOT NULL,
  title TEXT NOT NULL,
  assignee TEXT,
  status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
)

-- 법률안 (API 자동 수집)
bills (
  id UUID PRIMARY KEY,
  bill_id TEXT UNIQUE NOT NULL, -- 국회 의안 ID
  bill_no TEXT, -- 의안번호
  bill_name TEXT NOT NULL,
  propose_date DATE,
  proposer_type ENUM('lead', 'co') NOT NULL, -- 대표발의 vs 공동발의
  committee TEXT,
  proc_result TEXT, -- 처리 결과
  detail_link TEXT,
  issue_id UUID REFERENCES issues(id), -- nullable
  synced_at TIMESTAMPTZ DEFAULT now()
)

-- 표결 기록 (API 자동 수집)
votes (
  id UUID PRIMARY KEY,
  bill_id TEXT NOT NULL,
  bill_name TEXT,
  vote_date DATE,
  vote_result ENUM('찬성', '반대', '기권', '불참'),
  synced_at TIMESTAMPTZ DEFAULT now()
)

-- 시민 의견 (Voice)
opinions (
  id UUID PRIMARY KEY,
  type ENUM('policy_suggestion', 'field_report') NOT NULL,
  category ENUM(11개 카테고리) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  name TEXT, -- nullable (익명 허용)
  contact TEXT, -- nullable
  organization TEXT, -- nullable
  contact_consent BOOLEAN DEFAULT FALSE,
  privacy_consent BOOLEAN NOT NULL DEFAULT TRUE,
  status ENUM('unreviewed', 'reviewing', 'accepted', 'spam', 'redirected') DEFAULT 'unreviewed',
  issue_id UUID REFERENCES issues(id), -- nullable, 이슈 연결 후
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  turnstile_token TEXT, -- 스팸 검증용
  ip_hash TEXT, -- rate limiting용 (원본 IP 미저장)
  created_at TIMESTAMPTZ DEFAULT now()
)

-- 첨부파일
attachments (
  id UUID PRIMARY KEY,
  opinion_id UUID REFERENCES opinions(id),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

---

## 5. 라우팅 & 페이지 구조 (확정)

```
/                          → 랜딩 (의원 소개 + 최근 활동 요약 + 의견접수 링크)
/activity                  → 의정활동 메인 (타임라인)
/activity/bills            → 발의법률안 목록
/activity/votes            → 표결 기록
/activity/issues           → 현안별 브리프 목록
/activity/issues/[id]      → 개별 브리프 상세
/activity/about            → 의원 소개
/voice                     → 의견 접수 폼
/voice/complete            → 접수 완료 안내
/desk                      → [인증 필요] 대시보드
/desk/issues               → [인증 필요] 이슈 목록
/desk/issues/[id]          → [인증 필요] 이슈 상세/편집
/desk/issues/new           → [인증 필요] 이슈 생성
/desk/feed                 → [인증 필요] 수집 뉴스 피드
/desk/opinions             → [인증 필요] 시민 의견 관리
/desk/opinions/[id]        → [인증 필요] 의견 상세/분류
/desk/settings             → [인증 필요] 설정 (선거모드, 사용자 관리)
/login                     → 관리자 로그인
/privacy                   → 개인정보처리방침
```

---

## 6. 국회 API 연동 명세 (확정)

### 6.1 열린국회정보 API

```
Base URL: https://open.assembly.go.kr/portal/openapi/{SERVICE_CODE}
인증: API Key (쿼리 파라미터 KEY=)
응답 형식: JSON (Type=json) 또는 XML
페이지네이션: pIndex, pSize (최대 1000)
Rate Limit: 명시적 제한 없음, 안전하게 1초 간격 권장

이해민 의원 필터:
- 발의법률안: RST_PROPOSER LIKE '%이해민%' AND AGE=22
- 표결: 본회의 표결정보 API에서 MONA_CD=0698755I
- 위원회 일정: COMMITTEE='과학기술정보방송통신위원회'
```

### 6.2 API Key 발급 절차

```
1. https://open.assembly.go.kr 회원가입
2. 마이페이지 → API Key 발급 (즉시, 계정당 최대 10개)
3. 환경변수: ASSEMBLY_API_KEY
```

### 6.3 data.go.kr API

```
Base URL: http://apis.data.go.kr/9710000/NationalAssemblyInfoService/
인증: 서비스키 (쿼리 파라미터 serviceKey=)
일일 호출: 개발 10,000회 / 운영 별도 신청
```

---

## 7. 개인정보처리방침 핵심 항목 (확정, 출시 전 완성 필수)

```
1. 처리하는 개인정보 항목
   - [필수] 의견 내용
   - [선택] 이름, 연락처(이메일/전화), 소속
   - [자동수집] IP 해시(원본 미저장), 접속 일시, 브라우저 정보

2. 수집·이용 목적
   - 이해민 의원실 과방위 정책 참고자료 수집 및 분석
   - 후속 연락 (동의자에 한함)

3. 보관 기간
   - 의견 원문: 접수일로부터 2년
   - 연락처: 후속 연락 완료 후 6개월
   - 이후 지체 없이 파기

4. 제3자 제공: 없음

5. 국외 이전
   - AI 요약 처리: Anthropic (미국)
   - 데이터 저장: Supabase/AWS (싱가포르)
   - 웹 서비스 운영: Vercel (한국 서울 + 미국 엣지)

6. 정보주체 권리
   - 열람, 정정·삭제, 처리정지 요구 가능
   - 연락처: [의원실 이메일]

7. 개인정보 보호책임자
   - [의원실 지정 담당자]

8. 자동화된 결정
   - AI를 이용한 의견 분류·요약이 수행되나, 최종 판단은 사람이 수행
```

---

## 8. 선거법 대응 (확정)

```
공직선거법 제111조 (의정활동보고):
- 인터넷 홈페이지 게시는 선거기간에도 가능
- 단, "투표 호소성" 내용은 불가

제품 내 선거모드 구현:
┌─ ELECTION_MODE = true ──────────────────────────────┐
│ /activity:                                           │
│   - 자동 발행 중지                                    │
│   - 신규 브리프는 admin 승인 필수                      │
│   - 기존 공개 브리프는 유지 (소급 비공개 불필요)         │
│                                                       │
│ /voice:                                               │
│   - 접수는 계속 가능                                   │
│   - 공개 표시 불가                                     │
│                                                       │
│ /desk:                                                │
│   - 정상 운영                                          │
│   - 대시보드에 선거모드 경고 배너 표시                   │
│                                                       │
│ 관리자 설정:                                           │
│   - ON/OFF 토글                                       │
│   - 토글 변경 시 감사 로그 기록                         │
└───────────────────────────────────────────────────────┘
```

---

## 9. 웹접근성 (확정)

```
목표: KWCAG 2.2 준수 (법적 의무는 아니지만, 의원실 플랫폼으로서 당연히 충족해야 함)

최소 요구사항:
- 모든 이미지에 alt 텍스트
- 키보드 내비게이션 완전 지원
- 최소 폰트 17px (고령 사용자)
- 색상 대비 4.5:1 이상
- 폼 라벨 연결 (label + for)
- 200% 확대 시 가로 스크롤 없음
- 스크린리더 호환 (시맨틱 HTML)
- 모바일 퍼스트 (한국 성인 스마트폰 사용률 99%)
```

---

## 10. 프로젝트 구조 (확정)

```
haemin-platform/
├── src/
│   ├── app/
│   │   ├── (public)/              # 공개 페이지 그룹
│   │   │   ├── page.tsx           # 랜딩
│   │   │   ├── activity/          # 의정활동
│   │   │   ├── voice/             # 의견접수
│   │   │   ├── privacy/           # 개인정보처리방침
│   │   │   └── login/             # 관리자 로그인
│   │   ├── (desk)/                # 인증 필요 그룹
│   │   │   └── desk/              # 내부 이슈 데스크
│   │   ├── api/                   # API Routes
│   │   │   ├── cron/              # 자동 수집 크론
│   │   │   ├── assembly/          # 국회 API 프록시
│   │   │   ├── opinions/          # 의견 CRUD
│   │   │   ├── issues/            # 이슈 CRUD
│   │   │   └── ai/               # Claude 요약/분류
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                    # 공통 UI 컴포넌트
│   │   ├── desk/                  # Desk 전용
│   │   ├── activity/              # Activity 전용
│   │   └── voice/                 # Voice 전용
│   ├── lib/
│   │   ├── supabase/              # DB 클라이언트
│   │   ├── assembly-api/          # 국회 API 래퍼
│   │   ├── news-collector/        # 뉴스 수집
│   │   ├── ai/                    # Claude API 래퍼
│   │   └── utils/                 # 유틸리티
│   ├── types/                     # TypeScript 타입
│   └── constants/                 # 카테고리, 상수
├── supabase/
│   └── migrations/                # DB 마이그레이션
├── public/
├── .env.local                     # 환경변수
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 11. 환경변수 (확정)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 국회 API
ASSEMBLY_API_KEY=

# data.go.kr
DATA_GO_KR_SERVICE_KEY=

# Naver News API
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# Claude API (AI 요약/분류)
ANTHROPIC_API_KEY=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# 선거모드
NEXT_PUBLIC_ELECTION_MODE=false

# 크론 보안
CRON_SECRET=
```

---

## 12. 개발 순서 (확정)

### Phase 1: Foundation + Desk MVP (Week 1-2)

```
1. 프로젝트 초기화 (Next.js 15 + TypeScript + Tailwind v4)
2. Supabase 프로젝트 생성 + DB 마이그레이션
3. 인증 (Supabase Auth, 이메일/비밀번호)
4. /desk 대시보드 기본 레이아웃
5. 이슈 CRUD (생성, 목록, 상세, 편집)
6. 후속조치 CRUD
7. 관리자 권한 체계 (admin/editor/viewer)
8. 국회 API 연동 (발의법률안, 표결, 위원회 일정)
9. 뉴스 자동 수집 파이프라인 (Naver API + RSS)
10. AI 요약/분류 (Claude API 연동)
```

### Phase 2: Activity (공개 브리프) (Week 3)

```
11. /activity 공개 페이지 레이아웃
12. 의정활동 타임라인 (API 자동 + Desk 발행 브리프)
13. 발의법률안 목록 페이지
14. 표결 기록 페이지
15. 의원 소개 페이지
16. 반응형 모바일 최적화
17. SEO (메타태그, OG 이미지)
```

### Phase 3: Voice (의견 접수) (Week 4)

```
18. /voice 의견 접수 폼
19. Cloudflare Turnstile 연동
20. Rate Limiting (Upstash)
21. 개인정보 동의 UI
22. /desk/opinions 관리 화면
23. 의견 → 이슈 연결 기능
24. 개인정보처리방침 페이지
```

### Phase 4: Polish & Deploy (Week 4-5)

```
25. 선거모드 토글 + 감사 로그
26. 웹접근성 검수
27. 에러 처리 + 빈 상태(empty state) UI
28. 커스텀 도메인 설정
29. Vercel 배포 (Seoul 리전)
30. 우준이 피드백 수집 → 수정
```

---

## 13. Claude Code 개발 지시 사항

```
이 PRD를 Claude Code에 전달할 때 아래를 함께 전달:

"이 PRD에 따라 이해민 의원실 통합 웹 플랫폼을 개발합니다.

기술 스택: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + Supabase
개발 순서: Phase 1 (Desk) → Phase 2 (Activity) → Phase 3 (Voice) → Phase 4 (Polish)

핵심 원칙:
1. 모바일 퍼스트 (한국 사용자 99% 스마트폰)
2. 최소 폰트 17px, 색상 대비 4.5:1 이상
3. 시맨틱 HTML (웹접근성)
4. 한국어 UI (날짜는 YYYY.MM.DD 형식)
5. 공개 페이지는 SSG/ISR, 관리자 페이지는 CSR
6. 모든 API 호출은 서버사이드 (API 키 노출 금지)
7. 에러 처리 철저 (빈 상태, 로딩, 에러 UI)

디자인 방향:
- 톤: 신뢰감 있고 깔끔한 공공 서비스 느낌
- 색상: 진한 네이비 (#1a2332) + 화이트 + 포인트 블루 (#2563eb)
- 폰트: Pretendard (본문) + Pretendard Bold (제목)
- 레이아웃: 공개 페이지는 단일 컬럼 중심, Desk는 사이드바 + 메인 레이아웃

Phase 1부터 시작해주세요."
```

---

## 부록: 도입 전 재검증 필요 항목

아래는 "확정 사실"이 아닌 "도입 시점에 재확인 필요"한 항목:

1. BIGKinds API 접근조건 (MOU 필요 여부 → v1 제외로 결정)
2. 특정 CSP의 현재 CSAP 인증 상태 (v1에서 불필요로 결정)
3. 열린국회정보 API의 실시간 가용성 (개발 초기에 테스트 호출로 확인)
4. 커스텀 도메인 (우준이 확인 후 결정)
5. 의원실 공식 이메일/연락처 (개인정보처리방침용)
6. 이해민 의원 프로필 사진 사용 허가 (의원실 확인)
