import { describe, it, expect } from "vitest";
import { canDo, type Role } from "./roles";

describe("canDo (RBAC matrix)", () => {
  it("admin 은 모든 capability 허용", () => {
    expect(canDo("admin", "user.manage")).toBe(true);
    expect(canDo("admin", "brief.publish")).toBe(true);
    expect(canDo("admin", "flag.manage")).toBe(true);
    expect(canDo("admin", "issue.write")).toBe(true);
  });

  it("editor 는 글쓰기 가능하지만 발행/플래그 관리 불가", () => {
    expect(canDo("editor", "issue.write")).toBe(true);
    expect(canDo("editor", "brief.draft")).toBe(true);
    expect(canDo("editor", "brief.publish")).toBe(false);
    expect(canDo("editor", "flag.manage")).toBe(false);
    expect(canDo("editor", "user.manage")).toBe(false);
  });

  it("reviewer 는 발행·아카이브는 되지만 초안 작성은 capability 에 없음", () => {
    expect(canDo("reviewer", "brief.publish")).toBe(true);
    expect(canDo("reviewer", "brief.review")).toBe(true);
    expect(canDo("reviewer", "issue.write")).toBe(false);
    expect(canDo("reviewer", "source.write")).toBe(false);
  });

  it("viewer 는 읽기만 가능", () => {
    expect(canDo("viewer", "desk.view")).toBe(true);
    expect(canDo("viewer", "issue.write")).toBe(false);
    expect(canDo("viewer", "brief.publish")).toBe(false);
  });

  it("undefined·null role 은 어떤 capability 도 허용되지 않음", () => {
    expect(canDo(undefined, "desk.view")).toBe(false);
    expect(canDo(null, "issue.write")).toBe(false);
    expect(canDo(null as unknown as Role, "desk.view")).toBe(false);
  });
});
