# haimin-issue-desk

이해민 의원실 / 과방위 통합 플랫폼. 하나의 코드베이스 안에 세 개의 사용자 표면을 갖는다.

| 모듈 | 경로 | 대상 | 상태 |
| --- | --- | --- | --- |
| Desk | `/desk` | 의원실 실무자 (비공개) | v1 본체 |
| Brief | `/brief` | 시민·언론·업계 | 공개 |
| Voice | `/voice` | 정책 제안자 | feature flag로 **초기 OFF** |

제품의 본체는 `Desk` 다. 공개 `Brief` 는 Desk에서 reviewer 승인된 결과만 노출한다. `Voice` 는 코드상 구현하되 초기 배포에서는 꺼 둔다.

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
      voice/                 정책 제안 폼 (feature flag로 404)
      privacy/  terms/  source-policy/  accessibility/
    desk/                    내부 이슈 데스크 (로그인 가드)
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

1. **공개 브리프는 reviewer 승인 후에만 노출**. 소스가 0개면 발행 불가.
2. **AI는 선택사항**. `FEATURE_AI_DEFAULT=false` 여도 앱 전체가 완전히 동작해야 한다.
3. **voice는 공식 청원이 아님**. 모든 카피는 "정책 제안/현장 의견 접수"로 통일.
4. **관리자 주요 액션은 audit log 기록**. 비밀번호/민감 원문은 로그에 남기지 않는다.
5. **하드코딩 금지**: 의원 `MONA_CD`, 카테고리 목록, 서비스코드 설명, 선거모드 날짜.
6. **모바일 우선·접근성 우선**. 본문 기본 17px. 명암비 AA.

## 역할

| role | 권한 |
| --- | --- |
| admin | 사용자/플래그/카테고리/브리프 발행 전부 |
| editor | 이슈·소스·브리프 초안 작성·수정 |
| reviewer | 브리프 review → publish 승인 |
| viewer | 읽기 전용 |

## Feature flags

| key | 기본값 | 설명 |
| --- | --- | --- |
| `voice_enabled` | `false` | voice 모듈 공개 여부 |
| `election_mode` | `true` | 선거모드. 자동 발행 금지 + reviewer 필수 |
| `ai_enabled` | `false` | LLM 연동 사용 여부 |

DB 값이 있으면 DB 값을, 없으면 env 기본값을 사용한다.

## DB

```
npm run db:generate    # 스키마 diff → SQL 마이그레이션 생성
npm run db:push        # 개발용: schema 바로 반영
npm run db:migrate     # 운영용: 생성된 SQL 적용
npm run db:seed        # 카테고리 / flags / seed 계정
npm run db:studio      # Drizzle Studio
```

## 문서

- `docs/PRD.md` — 개발 착수 확정본
- `docs/RESEARCH.md` — 리서치 원본 (참고용, 불일치 시 PRD 우선)
- `docs/KICKOFF.md` — Claude Code 지시 프롬프트
