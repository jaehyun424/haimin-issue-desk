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
});
