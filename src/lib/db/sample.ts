/**
 * 데모/샘플 seed.
 *
 * 주의:
 * - 아래 내용은 2026-04-15 시점의 공개 정책 영역(AI기본법 하위법령, SKT 해킹 후속
 *   정보보호 규제, AIDC 특별법 논의)을 "의원실이 추적 중인 현안" 관점에서 일반화한
 *   **샘플**이다. 특정 발의·표결·발언 사실로 읽히지 않도록 작성 톤에 유의.
 * - 멱등 처리: slug 또는 name 으로 존재 확인 후 없을 때만 insert.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "./index";
import {
  briefs,
  issueCategories,
  issueSourceLinks,
  issues,
  sourceDocuments,
  users,
} from "./schema";
import { koreanSlug } from "../utils";

interface SampleSourceSpec {
  sourceType: "assembly_api" | "news_api" | "rss" | "manual";
  sourceName: string;
  title: string;
  url: string;
  publishedAt: string; // ISO 날짜
  bodyText?: string;
  isPrimary?: boolean;
}

interface SampleSpec {
  categoryName: string;
  issue: {
    slug: string;
    title: string;
    summary: string;
    priority: "low" | "medium" | "high" | "critical";
  };
  sources: SampleSourceSpec[];
  brief: {
    slug: string;
    title: string;
    summary: string;
    bodyMd: string;
  };
}

function hashSource(opts: { url: string; title: string; publishedAt: string }) {
  return createHash("sha256")
    .update([opts.url, opts.title, opts.publishedAt].join("|"))
    .digest("hex")
    .slice(0, 40);
}

const SAMPLES: SampleSpec[] = [
  {
    categoryName: "AI·데이터·고영향 AI",
    issue: {
      slug: "ai-basic-act-subordinate-legislation",
      title: "AI 기본법 시행 하위법령 제정 동향",
      summary:
        "AI 기본법 시행을 위한 하위법령(고영향 AI 영향평가 고시·시행령)의 쟁점 정리. 업계·시민사회 의견 수렴 진행 중.",
      priority: "high",
    },
    sources: [
      {
        sourceType: "manual",
        sourceName: "과학기술정보통신부",
        title: "AI 기본법 시행을 위한 하위법령 제정방안 공청회 개최 안내",
        url: "https://www.msit.go.kr/bbs/view.do?sCode=user&mId=113",
        publishedAt: "2026-04-01T09:00:00+09:00",
        bodyText:
          "과기정통부는 AI 기본법 시행령·고시(안)에 대한 공청회를 개최하고 업계·학계 의견을 수렴한다.",
        isPrimary: true,
      },
      {
        sourceType: "manual",
        sourceName: "국회입법조사처",
        title: "AI 영향평가 제도 해외 사례와 시사점",
        url: "https://www.nars.go.kr/",
        publishedAt: "2026-03-20T10:00:00+09:00",
        bodyText:
          "EU AI Act 의 고영향 AI 영향평가·적합성 평가 운영 방식과 한국 제도 설계 시 고려할 점.",
      },
    ],
    brief: {
      slug: "ai-basic-act-subordinate-legislation-brief",
      title: "AI 기본법 하위법령, 무엇이 쟁점인가",
      summary:
        "고영향 AI 영향평가 대상·절차·공개 범위를 둘러싼 업계·시민사회의 상반된 요구를 정리하고, 하위법령 설계 시 공공성·예측가능성·국제 정합성을 모두 확보해야 한다는 시각을 공유합니다.",
      bodyMd: `## 이슈 개요

AI 기본법 시행을 위한 하위법령(시행령·고시) 제정이 마무리 단계에 들어섰다. 가장 큰 쟁점은 **고영향 AI 영향평가의 대상·절차·공개 범위**다. 정부는 예측 가능성과 행정 집행력을, 업계는 절차 간소화를, 시민사회는 투명성·외부 감시 가능성을 요구하고 있다.

## 현재 상황

- 과기정통부는 영향평가 대상 AI 유형, 평가 주체(자체평가 vs. 제3자), 결과 공개 범위에 대한 공청회를 진행했다.
- 영향평가 결과의 **부분 공개** 여부가 쟁점으로 부상했다. 국제 정합성(EU AI Act) 관점에서는 공개가 원칙이나, 기업 비밀·보안 이슈가 상존한다.
- 국회입법조사처는 해외 사례 비교 보고서에서 **영향평가 + 사후 감사** 이원 구조를 제안했다.

## 이해민 의원실 관련 활동

- 의원실은 업계·시민사회·학계 자문 그룹과의 사전 간담회를 진행 중이며, 공청회 의견을 바탕으로 과방위 법안소위 단계에서 대안을 마련하는 방향을 검토한다.
- 핵심 원칙: **공공성 우선, 예측가능성 확보, 국제 정합성 유지**.

## 관련 법안·회의

- AI 기본법 제2조(고영향 AI 정의) 하위 고시 (정부안)
- 과기정통부 시행령(안) 행정예고

## 참고한 공식 자료

- [과기정통부 AI 기본법 하위법령 공청회](https://www.msit.go.kr/bbs/view.do?sCode=user&mId=113)
- [국회입법조사처 AI 영향평가 제도 해외 사례 보고서](https://www.nars.go.kr/)
`,
    },
  },
  {
    categoryName: "사이버보안·침해사고·정보보호",
    issue: {
      slug: "skt-breach-follow-up-infosec",
      title: "SKT 침해사고 후속 정보보호 규제 정비",
      summary:
        "대규모 이동통신 침해사고 이후 정보보호 세액공제·CISO 책임·침해사고 의무 신고 체계 재정비 논의.",
      priority: "critical",
    },
    sources: [
      {
        sourceType: "manual",
        sourceName: "한국인터넷진흥원(KISA)",
        title: "2026년 상반기 정보보호 수준평가 결과 및 개선 권고",
        url: "https://www.kisa.or.kr/",
        publishedAt: "2026-03-28T09:00:00+09:00",
        bodyText:
          "KISA 는 이동통신사의 침입탐지·권한관리 취약점 개선 권고를 공표했다.",
        isPrimary: true,
      },
      {
        sourceType: "manual",
        sourceName: "과학기술정보통신부",
        title: "침해사고 신고체계 개선 및 정보보호 투자 인센티브 재설계 방안",
        url: "https://www.msit.go.kr/",
        publishedAt: "2026-04-05T09:00:00+09:00",
        bodyText:
          "정보보호 세액공제 확대와 침해사고 신고 시한 단축을 포함한 제도 개선안.",
      },
    ],
    brief: {
      slug: "skt-breach-follow-up-infosec-brief",
      title: "SKT 침해사고 이후, 정보보호 규제는 어떻게 바뀌어야 하는가",
      summary:
        "대규모 침해사고를 계기로 드러난 이동통신 보안 체계의 취약점과, 정보보호 세액공제 재설계·CISO 책임 강화·침해사고 의무 신고 체계 정비 방향을 정리합니다.",
      bodyMd: `## 이슈 개요

대규모 이동통신 침해사고 이후 업계 전반의 **침입탐지·권한관리·로그 보관** 체계가 도마에 올랐다. 이와 함께 **정보보호 세액공제**의 실효성, **CISO(정보보호 최고책임자)의 법적 책임** 강화, **침해사고 의무 신고 체계** 재정비가 과방위 주요 과제로 부상했다.

## 현재 상황

- KISA 는 2026년 상반기 정보보호 수준평가 결과 발표 자료에서 일부 이동통신사의 **권한관리·침입탐지 취약점**을 지적했다.
- 과기정통부는 **정보보호 세액공제 확대**와 **침해사고 신고 시한 단축(현행 24시간 → 축소 검토)**을 포함한 제도 개선안을 공개했다.

## 이해민 의원실 관련 활동

- 의원실은 정보보호 업계·학계와 함께 다음 세 트랙을 검토 중이다.
  1. 정보보호 투자 인센티브를 사업 규모·리스크 수준과 연동하는 방향
  2. CISO 의 법적 독립성·책임 명확화
  3. 침해사고 신고 체계의 **의무 신고 범위 확대 + 2차 피해 방지 공개 원칙** 병행

## 관련 법안·회의

- 정보통신망법 개정 논의 (침해사고 신고·대응)
- 정보보호산업법 세액공제 관련 고시
- 사이버안보기본법 제정 논의

## 참고한 공식 자료

- [KISA 정보보호 수준평가 결과](https://www.kisa.or.kr/)
- [과기정통부 침해사고 신고체계 개선안](https://www.msit.go.kr/)
`,
    },
  },
  {
    categoryName: "데이터센터·AIDC·전력·PPA",
    issue: {
      slug: "aidc-special-act-grid-access",
      title: "AIDC 특별법과 전력·계통 접속 쟁점",
      summary:
        "AI 데이터센터(AIDC) 특별법 제정 논의에서 계통 접속·전력 직접계약(PPA)·수도권 집중 완화 쟁점 정리.",
      priority: "high",
    },
    sources: [
      {
        sourceType: "manual",
        sourceName: "과학기술정보통신부",
        title: "AI 데이터센터 육성을 위한 특별법 제정안 공개 설명회",
        url: "https://www.msit.go.kr/",
        publishedAt: "2026-03-15T09:00:00+09:00",
        bodyText:
          "AIDC 입지·전력·냉각·보안 요구사항 및 정부 지원 방향.",
        isPrimary: true,
      },
      {
        sourceType: "manual",
        sourceName: "국회예산정책처",
        title: "AIDC 전력 수요 전망과 재생에너지 PPA 확대 시나리오",
        url: "https://www.nabo.go.kr/",
        publishedAt: "2026-02-22T10:00:00+09:00",
        bodyText:
          "2030년까지 AIDC 추가 수요, PPA 확대 시 계통 안정성 영향 분석.",
      },
    ],
    brief: {
      slug: "aidc-special-act-grid-access-brief",
      title: "AIDC 특별법, 전력·계통이 진짜 병목이다",
      summary:
        "AIDC 특별법 논의에서 대기 시간이 3년 이상인 계통 접속 문제, PPA 확대, 수도권 집중 완화가 핵심 병목이라는 점을 정리하고, 성장과 전력 안정의 균형점을 논의합니다.",
      bodyMd: `## 이슈 개요

AI 확산에 따른 연산 수요 급증으로 AI 데이터센터(AIDC) 투자 수요가 커졌지만, 실질적 병목은 **전력 계통 접속 대기**와 **냉각·용지 확보**다. 정부는 AIDC 특별법을 통해 입지·전력 지원·인허가 간소화를 추진하지만, 수도권 집중과 계통 부담 우려도 상존한다.

## 현재 상황

- 과기정통부는 AIDC 특별법(안) 설명회에서 **입지 지원·냉각·보안 요구사항**을 제시했다.
- 국회예산정책처는 재생에너지 PPA 확대 시 **계통 안정성 영향**이 제한적이라는 분석을 발표했다.
- 업계는 **계통 접속 대기 단축**과 **PPA 직접계약 활성화**가 핵심이라고 입을 모은다.

## 이해민 의원실 관련 활동

- 의원실은 AIDC 논의가 "데이터센터 유치 경쟁"이 아니라 **계통·전력·지역 균형** 관점에서 다뤄져야 한다는 기조로 검토 중이다.
- 쟁점 정리 방향:
  1. 계통 접속 대기 단축을 위한 송·배전 투자 로드맵 연계
  2. 재생에너지 PPA 확대 시의 요금·보조금 구조 명확화
  3. 수도권 집중을 완화할 지역별 인센티브 설계

## 관련 법안·회의

- AIDC 특별법(정부안) 입법예고
- 전기사업법·재생에너지법 연계 개정 논의

## 참고한 공식 자료

- [과기정통부 AIDC 특별법 설명자료](https://www.msit.go.kr/)
- [국회예산정책처 AIDC 수요 전망 보고서](https://www.nabo.go.kr/)
`,
    },
  },
];

async function ensureOwner(): Promise<string> {
  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, process.env.SEED_ADMIN_EMAIL ?? "admin@haimin.local"))
    .limit(1);
  if (!admin) {
    throw new Error(
      "admin seed 계정이 없습니다. 먼저 `npm run db:seed` 를 실행해 계정을 만드세요.",
    );
  }
  return admin.id;
}

async function seedOne(spec: SampleSpec, ownerId: string) {
  // 카테고리
  const [cat] = await db
    .select({ id: issueCategories.id })
    .from(issueCategories)
    .where(eq(issueCategories.name, spec.categoryName))
    .limit(1);
  if (!cat) {
    console.warn(`[sample] 카테고리 "${spec.categoryName}" 없음 → 스킵`);
    return;
  }

  // 이슈 (slug 로 멱등)
  const issueSlug = koreanSlug(spec.issue.slug);
  const [existingIssue] = await db
    .select({ id: issues.id })
    .from(issues)
    .where(eq(issues.slug, issueSlug))
    .limit(1);
  let issueId: string;
  if (existingIssue) {
    issueId = existingIssue.id;
    console.log(`[sample] 이슈 존재: ${issueSlug}`);
  } else {
    const [created] = await db
      .insert(issues)
      .values({
        slug: issueSlug,
        title: spec.issue.title,
        summary: spec.issue.summary,
        status: "published",
        priority: spec.issue.priority,
        primaryCategoryId: cat.id,
        ownerUserId: ownerId,
      })
      .returning({ id: issues.id });
    if (!created) throw new Error("issue insert 실패");
    issueId = created.id;
    console.log(`[sample] 이슈 생성: ${issueSlug}`);
  }

  // 소스 + 링크
  for (const s of spec.sources) {
    const publishedAt = new Date(s.publishedAt);
    const hash = hashSource({ url: s.url, title: s.title, publishedAt: s.publishedAt });

    const [existingSource] = await db
      .select({ id: sourceDocuments.id })
      .from(sourceDocuments)
      .where(eq(sourceDocuments.hash, hash))
      .limit(1);
    let sourceId: string;
    if (existingSource) {
      sourceId = existingSource.id;
    } else {
      const [created] = await db
        .insert(sourceDocuments)
        .values({
          sourceType: s.sourceType,
          sourceName: s.sourceName,
          title: s.title,
          url: s.url,
          bodyText: s.bodyText ?? null,
          publishedAt,
          fetchedAt: new Date(),
          hash,
          metadataJson: { createdVia: "sample.seed" },
        })
        .returning({ id: sourceDocuments.id });
      if (!created) throw new Error("source insert 실패");
      sourceId = created.id;
    }

    // link (중복 방지)
    const [existingLink] = await db
      .select({ id: issueSourceLinks.id })
      .from(issueSourceLinks)
      .where(
        and(
          eq(issueSourceLinks.issueId, issueId),
          eq(issueSourceLinks.sourceDocumentId, sourceId),
        ),
      )
      .limit(1);
    if (!existingLink) {
      await db.insert(issueSourceLinks).values({
        issueId,
        sourceDocumentId: sourceId,
        isPrimary: !!s.isPrimary,
        relevanceScore: s.isPrimary ? 100 : 60,
      });
    }
  }

  // 브리프 (slug 로 멱등)
  const briefSlug = koreanSlug(spec.brief.slug);
  const [existingBrief] = await db
    .select({ id: briefs.id })
    .from(briefs)
    .where(eq(briefs.slug, briefSlug))
    .limit(1);
  if (existingBrief) {
    console.log(`[sample] 브리프 존재: ${briefSlug}`);
    return;
  }
  const now = new Date();
  await db.insert(briefs).values({
    issueId,
    slug: briefSlug,
    title: spec.brief.title,
    summary: spec.brief.summary,
    bodyMd: spec.brief.bodyMd,
    status: "published",
    publishedAt: now,
    lastVerifiedAt: now,
    createdByUserId: ownerId,
    reviewerUserId: ownerId,
  });
  console.log(`[sample] 브리프 발행: ${briefSlug}`);
}

async function main() {
  const ownerId = await ensureOwner();
  for (const spec of SAMPLES) {
    await seedOne(spec, ownerId);
  }
  console.log("[sample] 완료");
  process.exit(0);
}

main().catch((err) => {
  console.error("[sample] 실패", err);
  process.exit(1);
});
