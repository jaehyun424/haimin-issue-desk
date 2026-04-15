/**
 * 과방위 11개 초기 카테고리 seed.
 *
 * 주의: 이 목록은 "초기값"일 뿐 고정 진리가 아니다.
 * 운영 중 `/desk/settings` 에서 수정 가능하도록 DB에 저장한다.
 * 코드 어디에서도 아래 name 문자열로 "조건 분기"를 해서는 안 된다.
 */

export interface CategorySeed {
  name: string;
  sortOrder: number;
}

export const INITIAL_CATEGORIES: CategorySeed[] = [
  { name: "AI·데이터·고영향 AI", sortOrder: 10 },
  { name: "데이터센터·AIDC·전력·PPA", sortOrder: 20 },
  { name: "사이버보안·침해사고·정보보호", sortOrder: 30 },
  { name: "통신·이동통신·망 이용", sortOrder: 40 },
  { name: "방송·미디어·플랫폼 규제", sortOrder: 50 },
  { name: "OTT·콘텐츠·저작권", sortOrder: 60 },
  { name: "반도체·국가전략기술", sortOrder: 70 },
  { name: "우주·과학기술·연구인프라", sortOrder: 80 },
  { name: "R&D 예산·거버넌스", sortOrder: 90 },
  { name: "개인정보·디지털권리·딥페이크", sortOrder: 100 },
  { name: "규제기관·법안소위·과방위 운영", sortOrder: 110 },
];
