import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PDFOptions {
  title: string;
  variant?: 'guide' | 'cheatsheet' | 'workbook';
}

interface TOCItem {
  level: number;
  text: string;
  id: string;
}

// ---------------------------------------------------------------------------
// Heading extraction
// ---------------------------------------------------------------------------

function extractHeadings(markdown: string): TOCItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const items: TOCItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    items.push({ level, text, id });
  }

  return items;
}

// ---------------------------------------------------------------------------
// Slugify (must match extractHeadings id generation)
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---------------------------------------------------------------------------
// Markdown → branded HTML
// ---------------------------------------------------------------------------

export function markdownToBrandedHTML(
  markdown: string,
  options: PDFOptions,
): string {
  const marked = new Marked(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code: string, lang: string) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
    }),
  );

  // Custom renderer to add ids to headings for TOC links
  const renderer = {
    heading({ text, depth }: { text: string; depth: number }) {
      const id = slugify(text);
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    },
  };
  marked.use({ renderer });

  const htmlContent = marked.parse(markdown) as string;
  const tocItems = extractHeadings(markdown);

  return buildFullHTML(htmlContent, tocItems, options);
}

// ---------------------------------------------------------------------------
// Full HTML document builder
// ---------------------------------------------------------------------------

function buildFullHTML(
  content: string,
  tocItems: TOCItem[],
  options: PDFOptions,
): string {
  const variantLabel =
    options.variant === 'cheatsheet'
      ? 'CHEAT SHEET'
      : options.variant === 'workbook'
        ? 'WORKBOOK'
        : 'GUIDE';

  const tocHTML = buildTOC(tocItems);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(options.title)} — AI Armory</title>
  <style>${getStyles()}</style>
</head>
<body>
  <!-- Header -->
  <header class="doc-header">
    <div class="logo-area">
      ${getLogoSVG()}
    </div>
    <div class="title-area">
      <h1 class="doc-title">${escapeHTML(options.title)}</h1>
      <span class="variant-badge">${variantLabel}</span>
    </div>
  </header>

  <hr class="header-rule">

  <!-- Table of Contents -->
  ${tocHTML}

  <!-- Content -->
  <main class="content">
    ${content}
  </main>

  <!-- Footer (visible in screen mode; print footer uses @page) -->
  <footer class="doc-footer">
    <span>AI Armory — aiarmory.shop</span>
  </footer>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Table of Contents builder
// ---------------------------------------------------------------------------

function buildTOC(items: TOCItem[]): string {
  if (items.length === 0) return '';

  const entries = items
    .map((item) => {
      const indent = item.level === 1 ? '' : item.level === 2 ? 'toc-l2' : 'toc-l3';
      return `<li class="toc-item ${indent}"><a href="#${item.id}">${escapeHTML(item.text)}</a></li>`;
    })
    .join('\n        ');

  return `
  <nav class="toc">
    <h2 class="toc-heading">Table of Contents</h2>
    <ul class="toc-list">
        ${entries}
    </ul>
  </nav>`;
}

// ---------------------------------------------------------------------------
// Inline SVG logo
// ---------------------------------------------------------------------------

function getLogoSVG(): string {
  return `<svg width="180" height="36" viewBox="0 0 180 36" xmlns="http://www.w3.org/2000/svg">
    <!-- Geometric accent: shield / hexagon -->
    <polygon points="18,2 32,10 32,26 18,34 4,26 4,10"
             fill="none" stroke="#4F46E5" stroke-width="2.5" stroke-linejoin="round"/>
    <polygon points="18,8 27,13 27,23 18,28 9,23 9,13"
             fill="#4F46E5" opacity="0.15"/>
    <text x="12" y="23" font-family="system-ui, -apple-system, sans-serif"
          font-size="12" font-weight="700" fill="#4F46E5" text-anchor="middle">A</text>
    <!-- Brand text -->
    <text x="42" y="16" font-family="system-ui, -apple-system, sans-serif"
          font-size="13" font-weight="800" letter-spacing="2.5" fill="#1E1B4B">AI</text>
    <text x="42" y="30" font-family="system-ui, -apple-system, sans-serif"
          font-size="13" font-weight="800" letter-spacing="2.5" fill="#1E1B4B">ARMORY</text>
  </svg>`;
}

// ---------------------------------------------------------------------------
// CSS styles
// ---------------------------------------------------------------------------

function getStyles(): string {
  return `
    /* ===== Reset & Base ===== */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A4;
      margin: 25mm 20mm 30mm 20mm;

      @bottom-center {
        content: "AI Armory — aiarmory.shop";
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        font-size: 9px;
        color: #94A3B8;
      }

      @bottom-right {
        content: counter(page);
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        font-size: 9px;
        color: #94A3B8;
      }
    }

    body {
      font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto,
                   "Helvetica Neue", Arial, sans-serif;
      font-size: 14px;
      line-height: 1.7;
      color: #1E293B;
      background: #FFFFFF;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 32px;
    }

    /* ===== Header ===== */
    .doc-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 8px;
    }

    .logo-area { flex-shrink: 0; }

    .title-area { flex: 1; }

    .doc-title {
      font-size: 26px;
      font-weight: 800;
      color: #1E1B4B;
      letter-spacing: -0.5px;
      line-height: 1.2;
      margin: 0;
      border: none;
      padding: 0;
    }

    .variant-badge {
      display: inline-block;
      margin-top: 4px;
      padding: 2px 10px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #4F46E5;
      background: #EEF2FF;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .header-rule {
      border: none;
      border-top: 2px solid #E2E8F0;
      margin: 16px 0 32px;
    }

    /* ===== Table of Contents ===== */
    .toc {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 24px 28px;
      margin-bottom: 40px;
      break-inside: avoid;
    }

    .toc-heading {
      font-size: 14px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 12px;
      border: none;
      padding: 0;
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .toc-item {
      margin: 0;
      padding: 4px 0;
    }

    .toc-item a {
      color: #334155;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: color 0.15s;
    }

    .toc-item a:hover { color: #4F46E5; }

    .toc-l2 { padding-left: 20px; }
    .toc-l3 { padding-left: 40px; font-size: 12px; }
    .toc-l3 a { font-weight: 400; color: #64748B; }

    /* ===== Content headings ===== */
    .content h1 {
      font-size: 28px;
      font-weight: 800;
      color: #1E1B4B;
      margin: 48px 0 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #E2E8F0;
      line-height: 1.25;
      break-before: page;
    }

    .content h1:first-child { break-before: auto; margin-top: 0; }

    .content h2 {
      font-size: 21px;
      font-weight: 700;
      color: #1E1B4B;
      margin: 36px 0 12px;
      padding-left: 14px;
      border-left: 4px solid #4F46E5;
      line-height: 1.3;
    }

    .content h3 {
      font-size: 17px;
      font-weight: 700;
      color: #334155;
      margin: 28px 0 8px;
      line-height: 1.35;
    }

    /* ===== Paragraphs & text ===== */
    .content p {
      margin: 0 0 16px;
    }

    .content a {
      color: #4F46E5;
      text-decoration: underline;
      text-decoration-color: #C7D2FE;
      text-underline-offset: 2px;
    }

    .content strong { font-weight: 700; color: #0F172A; }

    /* ===== Code ===== */
    .content code {
      font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono",
                   "Cascadia Code", Menlo, Consolas, monospace;
      font-size: 0.88em;
      background: #F1F5F9;
      color: #1E293B;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .content pre {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 20px;
      margin: 0 0 20px;
      overflow-x: auto;
      break-inside: avoid;
    }

    .content pre code {
      background: none;
      padding: 0;
      border-radius: 0;
      font-size: 13px;
      line-height: 1.6;
    }

    /* highlight.js overrides for print-friendly colors */
    .hljs { background: transparent; color: #1E293B; }
    .hljs-keyword { color: #7C3AED; font-weight: 600; }
    .hljs-string { color: #059669; }
    .hljs-comment { color: #94A3B8; font-style: italic; }
    .hljs-number { color: #D97706; }
    .hljs-function .hljs-title,
    .hljs-title.function_ { color: #2563EB; }
    .hljs-built_in { color: #0891B2; }
    .hljs-attr { color: #4F46E5; }
    .hljs-params { color: #64748B; }
    .hljs-type { color: #7C3AED; }
    .hljs-meta { color: #94A3B8; }
    .hljs-literal { color: #D97706; }
    .hljs-variable { color: #1E293B; }

    /* ===== Tables ===== */
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 20px;
      font-size: 13px;
      break-inside: avoid;
    }

    .content th {
      background: #F1F5F9;
      font-weight: 700;
      text-align: left;
      padding: 10px 14px;
      border: 1px solid #E2E8F0;
      color: #334155;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .content td {
      padding: 10px 14px;
      border: 1px solid #E2E8F0;
      color: #475569;
    }

    .content tr:nth-child(even) td { background: #F8FAFC; }

    /* ===== Blockquotes (callout/tip boxes) ===== */
    .content blockquote {
      background: #EEF2FF;
      border-left: 4px solid #4F46E5;
      border-radius: 0 8px 8px 0;
      padding: 16px 20px;
      margin: 0 0 20px;
      color: #312E81;
      font-size: 13.5px;
      break-inside: avoid;
    }

    .content blockquote p { margin: 0 0 8px; }
    .content blockquote p:last-child { margin: 0; }

    .content blockquote code {
      background: rgba(79, 70, 229, 0.1);
      color: #312E81;
    }

    /* ===== Lists ===== */
    .content ul, .content ol {
      margin: 0 0 16px;
      padding-left: 24px;
    }

    .content li {
      margin: 0 0 6px;
      line-height: 1.65;
    }

    .content li > ul, .content li > ol { margin: 6px 0 0; }

    /* ===== Horizontal rules ===== */
    .content hr {
      border: none;
      border-top: 1px solid #E2E8F0;
      margin: 32px 0;
    }

    /* ===== Images ===== */
    .content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 8px 0 16px;
    }

    /* ===== Footer ===== */
    .doc-footer {
      margin-top: 60px;
      padding-top: 16px;
      border-top: 1px solid #E2E8F0;
      text-align: center;
      font-size: 12px;
      color: #94A3B8;
    }

    /* ===== Print overrides ===== */
    @media print {
      body {
        max-width: none;
        padding: 0;
        font-size: 12px;
      }

      .doc-header { break-inside: avoid; }

      .toc { break-inside: avoid; }

      .content h1 { break-before: page; }
      .content h1:first-child { break-before: auto; }

      .content h2, .content h3 {
        break-after: avoid;
      }

      .content pre, .content table, .content blockquote {
        break-inside: avoid;
      }

      .content a { color: #4F46E5; text-decoration: none; }
      .content a[href^="http"]::after {
        content: " (" attr(href) ")";
        font-size: 10px;
        color: #94A3B8;
        word-break: break-all;
      }

      .doc-footer { display: none; }
    }
  `;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
