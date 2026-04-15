export const ROLES = ["admin", "editor", "reviewer", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "관리자",
  editor: "편집자",
  reviewer: "검토자",
  viewer: "열람자",
};

/**
 * 권한 계층.
 * - admin: 모든 권한
 * - editor: 이슈/소스/브리프 초안 작성·수정
 * - reviewer: 브리프 발행 승인
 * - viewer: 읽기 전용
 *
 * 서버/라우트 가드에서는 `canDo(role, capability)` 를 통해 판단한다.
 */
export type Capability =
  | "desk.view"
  | "issue.write"
  | "source.write"
  | "brief.draft"
  | "brief.review"
  | "brief.publish"
  | "voice.triage"
  | "settings.manage"
  | "user.manage"
  | "category.manage"
  | "flag.manage"
  | "audit.view";

const MATRIX: Record<Role, Capability[]> = {
  admin: [
    "desk.view",
    "issue.write",
    "source.write",
    "brief.draft",
    "brief.review",
    "brief.publish",
    "voice.triage",
    "settings.manage",
    "user.manage",
    "category.manage",
    "flag.manage",
    "audit.view",
  ],
  editor: [
    "desk.view",
    "issue.write",
    "source.write",
    "brief.draft",
    "voice.triage",
  ],
  reviewer: ["desk.view", "brief.review", "brief.publish", "voice.triage", "audit.view"],
  viewer: ["desk.view"],
};

export function canDo(role: Role | undefined | null, capability: Capability): boolean {
  if (!role) return false;
  return MATRIX[role].includes(capability);
}
