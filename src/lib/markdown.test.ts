import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown (safe subset)", () => {
  it("H2 / H3 렌더", () => {
    const html = renderMarkdown("## 제목\n### 서브");
    expect(html).toContain("<h2>제목</h2>");
    expect(html).toContain("<h3>서브</h3>");
  });

  it("script 태그는 이스케이프됨", () => {
    const html = renderMarkdown("본문 <script>alert(1)</script> 끝");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("링크는 target=_blank + rel 자동 부여", () => {
    const html = renderMarkdown("[테스트](https://example.com)");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer noopener"');
  });

  it("리스트 렌더", () => {
    const html = renderMarkdown("- 항목1\n- 항목2");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>항목1</li>");
  });

  it("들여쓴 번호 리스트도 ol 로 렌더(단순화)", () => {
    const md = [
      "본문 문장.",
      "  1. 첫째",
      "  2. 둘째",
      "  3. 셋째",
    ].join("\n");
    const html = renderMarkdown(md);
    expect(html).toContain("<ol>");
    expect(html).toContain("<li>첫째</li>");
    expect(html).toContain("<li>둘째</li>");
    expect(html).toContain("<li>셋째</li>");
  });

  it("들여쓴 ul 도 동일 레벨로 처리", () => {
    const html = renderMarkdown("  - 들여쓴\n  - 항목");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>들여쓴</li>");
    expect(html).toContain("<li>항목</li>");
  });
});
