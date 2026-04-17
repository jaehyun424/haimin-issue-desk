# haimin-issue-desk

이해민 의원실(조국혁신당·비례대표·과학기술정보방송통신위원회) 공식 웹 플랫폼.
하나의 코드베이스 안에 세 개의 사용자 표면을 갖는다.

| 모듈 | 경로 | 대상 | 상태 |
| --- | --- | --- | --- |
| 관리 콘솔 | `/desk` | 의원실 실무자 (비공개) | v1 본체 |
| 공개 브리프 | `/brief` | 시민·언론·업계 | 공개 |
| 정책 제안 | `/voice` | 정책 제안자 | `voice_enabled` 플래그로 운영 제어 (현재 ON) |

제품의 본체는 관리 콘솔이다. 공개 브리프는 관리 콘솔에서 의원실 검토를 거쳐 발행된
결과만 노출한다. 정책 제안 모듈은 voice_enabled 플래그로 운영 여부를 제어하며,
초기 공개 배포에서는 flag=ON 으로 접수 중이다 (관리자 설정 > 기능 설정에서 즉시 OFF
전환 가능).

---

## 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 로컬 env 준비
cp .env.example .env.local
#   - AUTH_SECRET: openssl rand -base64 32
#   - DATABASE_URL: 로컬 Postgres 16
#   - SEED_ADMIN_PASSWORD / SEED_EDITOR_PASSWORD

# 3. DB 스키마 적용 + 시드
npm run db:push
npm run db:seed

# 4. 개발 서버
npm run dev
```

공개 페이지는 `http://localhost:3000/`, 관리자 로그인은 `http://localhost:3000/desk/login`.

---

## 기술 스택

- Next.js 15 (App Router) + React 19 + TypeScript strict
- Tailwind CSS 3 + shadcn/ui (new-york 스타일) + Pretendard GOV
- PostgreSQL 16 + Drizzle ORM + `postgres-js` 드라이버
- Auth.js v5 (credentials only, JWT 세션, bcrypt 해시)
- Zod + react-hook-form (폼/서버 검증 동일 스키마)
- Recharts (Desk 대시보드 차트)

## 프로젝트 구조

```
src/
  app/
    (public)/                공개 페이지 레이아웃 그룹
      page.tsx               홈
      brief/                 공개 브리프 (목록/상세/타임라인)
      voice/                 정책 제안 폼 (voice_enabled 플래그 OFF 시 404)
      privacy/  terms/  source-policy/  accessibility/
    desk/                    내부 관리 콘솔 (로그인 가드)
      login/
      issues/  sources/  briefs/  voice/  settings/
    api/
      auth/[...nextauth]/    Auth.js 핸들러
  components/
    ui/                      shadcn primitive (button/card/input/...)
    common/                  공용(헤더/푸터/소스리스트/freshness)
    desk/                    데스크 전용
    brief/                   브리프 전용
    voice/                   보이스 전용
  lib/
    db/                      drizzle 스키마·클라이언트·seed·migrate
    auth/                    Auth.js options·RBAC·세션 헬퍼
    feature-flags/           feature flag 서비스 (DB + env fallback)
    validation/              zod 스키마 모음
    audit/                   audit log helper
    constants/               카테고리·역할·플래그·문구
    utils.ts                 cn 등 공용 유틸
  types/                     공용 타입
drizzle/                     마이그레이션 SQL (생성물)
docs/                        PRD·RESEARCH·KICKOFF
```

## 운영 원칙 (발췌)

1. **공개 브리프는 의원실 검토 후에만 노출**. 소스가 0개면 발행 불가.
2. **AI는 선택사항**. `FEATURE_AI_DEFAULT=false` 여도 앱 전체가 완전히 동작해야 한다.
3. **정책 제안은 공식 청원이 아님**. 모든 카피는 "정책 제안/현장 의견 접수"로 통일.
4. **관리자 주요 액션은 audit log 기록**. 비밀번호/민감 원문은 로그에 남기지 않는다.
   로그인 성공/실패도 모두 기록(IP 해시·UA 포함, 비밀번호 제외).
5. **의원 정보 SSOT**: `src/lib/constants/member.ts` 에 의원 이름·정당·선거구·위원회·
   공식 이메일을 한 곳에 모아둔다. 사실관계 변경 시 이 파일 1곳만 수정.
6. **하드코딩 금지**: 카테고리 목록, 서비스코드 설명, 선거모드 날짜.
7. **모바일 우선·접근성 우선**. 본문 기본 17px. 명암비 AA.

## 역할 (RBAC)

| role | 권한 | v1 운영 |
| --- | --- | --- |
| admin | 사용자/플래그/카테고리/브리프 발행 전부 | ✅ 기본 계정 |
| editor | 이슈·소스·브리프 초안 작성·수정 | ✅ 기본 계정 |
| reviewer | 브리프 review → publish 승인 | 코드는 구현되어 있으며 의원실 규모 확장 시 활성화 |
| viewer | 읽기 전용 | 필요 시 수동 생성 |

## Feature flags

| key | 기본값 | 설명 |
| --- | --- | --- |
| `voice_enabled` | `true` (현재 운영) · 기본값 `false` | voice 모듈 공개 여부 |
| `election_mode` | `true` | 발행 안전모드. 자동 발행 금지 + 검토 단계 필수 |
| `ai_enabled` | `false` | LLM 연동 사용 여부 |

DB 값이 있으면 DB 값을, 없으면 env 기본값을 사용한다.

## DB

```
npm run db:generate           # 스키마 diff → SQL 마이그레이션 생성
npm run db:push               # 개발용: schema 바로 반영 (대화형)
npm run db:migrate            # 운영용: 생성된 SQL 적용 (비대화형)
npm run db:seed               # 카테고리 / flags / admin·editor seed 계정
npm run db:seed:sample        # 샘플 이슈·출처·브리프 4세트 (데모용, 멱등)
npm run db:seed:activities    # 의정활동 타임라인 10건 (멱등)
npm run db:studio             # Drizzle Studio
```

**주의**: `seed-activities.ts` 의 일부 항목은 언론 보도 URL을 임시로 사용하고 있습니다.
배포 전 `likms.assembly.go.kr` 에서 의안번호·공식 URL을 확인해 교체해 주세요.
(`metadataJson.needsOfficialUrl=true` 인 항목이 대상)

## Vercel 배포

이 앱은 Vercel Seoul(`icn1`) 리전 + 국내 PostgreSQL 조합을 기준으로 설계했다.

### 환경변수 체크리스트

| key | 스코프 | 필수 | 설명 |
| --- | --- | --- | --- |
| `DATABASE_URL` | Production / Preview | ✅ | 국내 PG16 연결 URL (`postgres://user:pw@host:5432/db?sslmode=require`) |
| `AUTH_SECRET` | Production / Preview | ✅ | `openssl rand -base64 32` 로 환경별 생성 |
| `AUTH_TRUST_HOST` | Production / Preview | ✅ | Vercel 뒤에서 `"true"` 고정 |
| `NEXT_PUBLIC_APP_URL` | Production / Preview | ✅ | 공개 도메인 (커스텀 `.kr` 권장) |
| `APP_ENV` | 모두 | ✅ | `local`/`staging`/`production` 중 하나 |
| `SEED_ADMIN_EMAIL` · `SEED_ADMIN_PASSWORD` | 초기 1회 | ⚠ | seed 실행 시점에만 사용. 이후 env 에서 제거 권장 |
| `SEED_EDITOR_EMAIL` · `SEED_EDITOR_PASSWORD` | 초기 1회 | ⚠ | 동일 |
| `FEATURE_VOICE_DEFAULT` / `FEATURE_ELECTION_MODE_DEFAULT` / `FEATURE_AI_DEFAULT` | 모두 | ❌ | DB flag 미존재 시 fallback 값. v1 배포는 기본값 유지 |
| `ASSEMBLY_API_KEY` / `DATA_GO_KR_SERVICE_KEY` / `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` | 수집기 활성화 시 | ❌ | 수집 파이프라인 연결 후 활성화 |
| `ANTHROPIC_API_KEY` | AI 사용 시 | ❌ | `ai_enabled=true` 이후에 설정 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | voice ON 시 | ❌ | `voice_enabled=true` 전에 설정 |
| `CRON_SECRET` | 크론 사용 시 | ❌ | Vercel cron 요청 인증 헤더 |

### 배포 순서

```bash
# 1. Vercel 프로젝트 생성 (혹은 import) 후 위 env 주입
# 2. 국내 PostgreSQL 에 마이그레이션 적용
DATABASE_URL="postgres://…" npm run db:migrate
DATABASE_URL="postgres://…" npm run db:seed
# 3. Vercel 에서 main 브랜치 자동 배포, Preview 는 PR 별
```

빌드 중에는 DB 를 호출하지 않도록 공개 페이지를 `dynamic = "force-dynamic"` 으로
표기했다. Preview 환경에 staging DB 연결을 권장.

## 문서

- `docs/PRD.md` — 개발 착수 확정본
- `docs/RESEARCH.md` — 리서치 원본 (참고용, 불일치 시 PRD 우선)
- `docs/KICKOFF.md` — Claude Code 지시 프롬프트
