/**
 * 의원 기본 정보 SSOT (Single Source of Truth).
 *
 * 사실관계가 바뀌면 이 파일 1곳만 수정한다. 사이트 전역의 의원 정보는 모두
 * 여기를 참조한다 — 하드코딩 금지.
 *
 * 공식 확인 출처 (party 검증, 2026-04-16 기준):
 *   1) https://www.assembly.go.kr/members/22nd/LEEHAIMIN
 *   2) https://open.assembly.go.kr/portal/assm/memberInfoPage.do?monaCd=0698755I
 *   3) https://open.assembly.go.kr/portal/assm/memberPage.do?monaCd=0698755I
 *   4) https://rebuildingkoreaparty.kr/about/member-of-parliament
 *
 * 주의:
 *   - officeEmail 은 공식 대외 연락 채널로 사용. 국회 도메인으로 단일화해 중립성 확보.
 *     (당 도메인 이메일은 당 운영 채널이며, 공식 의원실 커뮤니케이션과 분리)
 *   - assembly.go.kr 메일 시스템에서 실제 수신 가능한지는 의원실 점검 필요.
 */

export const MEMBER = {
  name: "이해민",
  nameEn: "Haimin Lee",
  party: "조국혁신당",
  district: "비례대표",
  committee: "과학기술정보방송통신위원회",
  committeeShort: "과방위",
  officeEmail: "haimin.office@assembly.go.kr",
  officialProfileUrl: "https://www.assembly.go.kr/members/22nd/LEEHAIMIN",
  assemblyTerm: "22대",
  monaCd: "0698755I",
  partyVerifiedAt: "2026-04-16",
  partySourceUrls: [
    "https://www.assembly.go.kr/members/22nd/LEEHAIMIN",
    "https://open.assembly.go.kr/portal/assm/memberInfoPage.do?monaCd=0698755I",
  ],
} as const;

export type MemberInfo = typeof MEMBER;
