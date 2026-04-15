/**
 * 아주 작은 Markdown → HTML 변환기.
 * - 외부 라이브러리(marked/remark) 의존성 없이 v1 요구를 채우기 위함.
 * - 허용 태그만 남기고 이스케이프(XSS 차단).
 * - 미완성 상황에서 브리프 본문이 절대 script 를 끼워넣지 못하도록 보수적으로 설계.
 *
 * 지원:
 *   # ##  ### 헤더
 *   -, 1. 리스트
 *   **bold**, *italic*
 *   [text](url)
 *   > blockquote
 *   빈 줄로 문단 분리
 *
 * 지원 안 함: 표, 이미지, 인라인 HTML.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(text: string): string {
  let s = escapeHtml(text);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, text: string, href: string) => {
    const safeHref = href.replace(/"/g, "%22");
    return `<a href="${safeHref}" target="_blank" rel="noreferrer noopener">${text}</a>`;
  });
  return s;
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let paragraph: string[] = [];
  let inQuote = false;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    out.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };
  const closeQuote = () => {
    if (inQuote) {
      out.push("</blockquote>");
      inQuote = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim() === "") {
      flushParagraph();
      closeList();
      closeQuote();
      continue;
    }
    const headerMatch = /^(#{1,3})\s+(.+)$/.exec(line);
    if (headerMatch) {
      flushParagraph();
      closeList();
      closeQuote();
      const level = headerMatch[1]!.length;
      out.push(`<h${level}>${inline(headerMatch[2]!)}</h${level}>`);
      continue;
    }
    const ulMatch = /^[-*]\s+(.*)$/.exec(line);
    if (ulMatch) {
      flushParagraph();
      closeQuote();
      if (listType !== "ul") {
        closeList();
        out.push("<ul>");
        listType = "ul";
      }
      out.push(`<li>${inline(ulMatch[1]!)}</li>`);
      continue;
    }
    const olMatch = /^\d+\.\s+(.*)$/.exec(line);
    if (olMatch) {
      flushParagraph();
      closeQuote();
      if (listType !== "ol") {
        closeList();
        out.push("<ol>");
        listType = "ol";
      }
      out.push(`<li>${inline(olMatch[1]!)}</li>`);
      continue;
    }
    const quoteMatch = /^>\s?(.*)$/.exec(line);
    if (quoteMatch) {
      flushParagraph();
      closeList();
      if (!inQuote) {
        out.push("<blockquote>");
        inQuote = true;
      }
      out.push(`<p>${inline(quoteMatch[1]!)}</p>`);
      continue;
    }
    closeList();
    closeQuote();
    paragraph.push(line);
  }
  flushParagraph();
  closeList();
  closeQuote();
  return out.join("\n");
}
