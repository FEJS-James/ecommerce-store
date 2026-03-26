import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PDFOptions {
  title: string;
  variant?: 'guide' | 'cheatsheet' | 'workbook';
  subtitle?: string;
  category?: string;
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
    const id = slugify(text);
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

  // Custom renderer to add ids to headings for TOC links + callout boxes
  const renderer = {
    heading({ text, depth }: { text: string; depth: number }) {
      const id = slugify(text);
      return `<h${depth} id="${id}">${text}</h${depth}>`;
    },
    blockquote({ raw }: { raw: string }) {
      // Detect callout patterns: > **Note:**, > **Tip:**, > **Warning:**, > **Important:**
      const calloutMatch = raw.match(
        />\s*\*\*(?:📝\s*)?(?:Note|NOTE)[:：]?\*\*/i,
      );
      const tipMatch = raw.match(
        />\s*\*\*(?:💡\s*)?(?:Tip|TIP)[:：]?\*\*/i,
      );
      const warningMatch = raw.match(
        />\s*\*\*(?:⚠️?\s*)?(?:Warning|WARNING|Caution|CAUTION)[:：]?\*\*/i,
      );
      const importantMatch = raw.match(
        />\s*\*\*(?:🔴\s*)?(?:Important|IMPORTANT)[:：]?\*\*/i,
      );

      // Strip leading > and parse inner content
      const innerMd = raw
        .split('\n')
        .map((line: string) => line.replace(/^>\s?/, ''))
        .join('\n')
        .trim();
      const innerHtml = marked.parse(innerMd) as string;

      if (warningMatch) {
        return `<div class="callout callout-warning"><div class="callout-icon">⚠️</div><div class="callout-content">${innerHtml}</div></div>`;
      }
      if (tipMatch) {
        return `<div class="callout callout-tip"><div class="callout-icon">💡</div><div class="callout-content">${innerHtml}</div></div>`;
      }
      if (importantMatch) {
        return `<div class="callout callout-important"><div class="callout-icon">🔴</div><div class="callout-content">${innerHtml}</div></div>`;
      }
      if (calloutMatch) {
        return `<div class="callout callout-note"><div class="callout-icon">📝</div><div class="callout-content">${innerHtml}</div></div>`;
      }

      // Default blockquote styling
      return `<blockquote>${innerHtml}</blockquote>`;
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
  const coverHTML = buildCoverPage(options, variantLabel);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(options.title)} — AI Armory</title>
  <style>${getStyles()}</style>
</head>
<body>

  ${coverHTML}

  <!-- Table of Contents -->
  ${tocHTML}

  <!-- Content -->
  <main class="content">
    ${content}
  </main>

  <!-- Back cover -->
  <div class="back-cover">
    <div class="back-cover-inner">
      ${getLogoSVG(120)}
      <p class="back-tagline">Premium AI Tools &amp; Resources</p>
      <div class="back-divider"></div>
      <p class="back-url">aiarmory.shop</p>
    </div>
  </div>

</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Cover page
// ---------------------------------------------------------------------------

function buildCoverPage(options: PDFOptions, variantLabel: string): string {
  const subtitle =
    options.subtitle || options.category || 'Premium AI Tools & Resources';

  return `
  <div class="cover-page">
    <div class="cover-bg-accent"></div>
    <div class="cover-content">
      <div class="cover-logo">
        ${getLogoSVG(200)}
      </div>
      <div class="cover-divider"></div>
      <h1 class="cover-title">${escapeHTML(options.title)}</h1>
      <p class="cover-subtitle">${escapeHTML(subtitle)}</p>
      <span class="cover-badge">${variantLabel}</span>
    </div>
    <div class="cover-footer">
      <span>aiarmory.shop</span>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// Table of Contents builder
// ---------------------------------------------------------------------------

function buildTOC(items: TOCItem[]): string {
  if (items.length === 0) return '';

  const entries = items
    .map((item) => {
      const indent =
        item.level === 1 ? '' : item.level === 2 ? 'toc-l2' : 'toc-l3';
      return `<li class="toc-item ${indent}"><a href="#${item.id}">${escapeHTML(item.text)}</a></li>`;
    })
    .join('\n        ');

  return `
  <nav class="toc">
    <div class="toc-header">
      <div class="toc-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="14" height="1.5" rx="0.75" fill="#4F46E5"/>
          <rect x="3" y="9.25" width="10" height="1.5" rx="0.75" fill="#4F46E5" opacity="0.6"/>
          <rect x="3" y="14.5" width="12" height="1.5" rx="0.75" fill="#4F46E5" opacity="0.3"/>
        </svg>
      </div>
      <h2 class="toc-heading">Table of Contents</h2>
    </div>
    <ul class="toc-list">
        ${entries}
    </ul>
  </nav>`;
}

// ---------------------------------------------------------------------------
// Inline SVG logo (scalable)
// ---------------------------------------------------------------------------

function getLogoSVG(width: number = 180): string {
  const height = Math.round(width * (40 / 180));
  return `<svg width="${width}" height="${height}" viewBox="0 0 180 40" xmlns="http://www.w3.org/2000/svg">
    <!-- Geometric accent: shield / hexagon -->
    <polygon points="20,2 35,11 35,29 20,38 5,29 5,11"
             fill="none" stroke="#4F46E5" stroke-width="2.5" stroke-linejoin="round"/>
    <polygon points="20,8 30,14 30,26 20,32 10,26 10,14"
             fill="#4F46E5" opacity="0.15"/>
    <text x="20" y="25" font-family="system-ui, -apple-system, sans-serif"
          font-size="14" font-weight="800" fill="#4F46E5" text-anchor="middle">A</text>
    <!-- Brand text -->
    <text x="48" y="17" font-family="system-ui, -apple-system, sans-serif"
          font-size="14" font-weight="800" letter-spacing="3" fill="#1E1B4B">AI</text>
    <text x="48" y="33" font-family="system-ui, -apple-system, sans-serif"
          font-size="14" font-weight="800" letter-spacing="3" fill="#1E1B4B">ARMORY</text>
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

      @bottom-left {
        content: "AI Armory  |  aiarmory.shop";
        font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        font-size: 8px;
        color: #94A3B8;
        letter-spacing: 0.3px;
      }

      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        font-size: 8px;
        color: #94A3B8;
      }

      @top-right {
        content: "AI ARMORY";
        font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        font-size: 7px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #C7D2FE;
      }
    }

    /* Cover page has no header/footer */
    @page :first {
      margin: 0;
      @bottom-left { content: none; }
      @bottom-right { content: none; }
      @top-right { content: none; }
    }

    body {
      font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto,
                   "Helvetica Neue", Arial, sans-serif;
      font-size: 14px;
      line-height: 1.75;
      color: #1E293B;
      background: #FFFFFF;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 32px;
      -webkit-font-smoothing: antialiased;
    }

    /* ===== Cover Page ===== */
    .cover-page {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 60px 48px;
      text-align: center;
      page-break-after: always;
      break-after: page;
      background: #FFFFFF;
      overflow: hidden;
    }

    .cover-bg-accent {
      position: absolute;
      top: -120px;
      right: -120px;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(79, 70, 229, 0.06) 0%, transparent 70%);
      pointer-events: none;
    }

    .cover-content {
      position: relative;
      z-index: 1;
    }

    .cover-logo {
      margin-bottom: 48px;
    }

    .cover-divider {
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #4F46E5, #7C3AED);
      margin: 0 auto 48px;
      border-radius: 2px;
    }

    .cover-title {
      font-size: 36px;
      font-weight: 800;
      color: #1E1B4B;
      letter-spacing: -0.5px;
      line-height: 1.2;
      margin: 0 0 16px;
      padding: 0;
      border: none;
      max-width: 600px;
    }

    .cover-subtitle {
      font-size: 16px;
      font-weight: 400;
      color: #64748B;
      margin: 0 0 32px;
      letter-spacing: 0.3px;
    }

    .cover-badge {
      display: inline-block;
      padding: 6px 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2.5px;
      color: #4F46E5;
      background: #EEF2FF;
      border: 1px solid #C7D2FE;
      border-radius: 20px;
      text-transform: uppercase;
    }

    .cover-footer {
      position: absolute;
      bottom: 48px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 13px;
      color: #94A3B8;
      letter-spacing: 1px;
    }

    /* ===== Table of Contents ===== */
    .toc {
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 32px 36px;
      margin-bottom: 48px;
      break-inside: avoid;
      page-break-after: always;
      break-after: page;
    }

    .toc-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #E2E8F0;
    }

    .toc-icon {
      flex-shrink: 0;
    }

    .toc-heading {
      font-size: 13px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin: 0;
      border: none;
      padding: 0;
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
      columns: 1;
    }

    .toc-item {
      margin: 0;
      padding: 0;
      border-bottom: 1px dotted #E2E8F0;
    }

    .toc-item:last-child { border-bottom: none; }

    .toc-item a {
      display: block;
      color: #1E293B;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      padding: 8px 0;
      transition: color 0.15s;
    }

    .toc-item a:hover { color: #4F46E5; }

    .toc-l2 { padding-left: 24px; }
    .toc-l2 a { font-weight: 500; font-size: 13px; color: #334155; }

    .toc-l3 { padding-left: 48px; }
    .toc-l3 a { font-weight: 400; font-size: 12px; color: #64748B; }

    /* ===== Content headings ===== */
    .content h1 {
      font-size: 28px;
      font-weight: 800;
      color: #1E1B4B;
      margin: 56px 0 20px;
      padding-bottom: 14px;
      border-bottom: 2px solid #E2E8F0;
      line-height: 1.25;
      letter-spacing: -0.3px;
      break-before: page;
    }

    .content h1:first-child { break-before: auto; margin-top: 0; }

    .content h2 {
      font-size: 21px;
      font-weight: 700;
      color: #1E1B4B;
      margin: 40px 0 14px;
      padding-left: 16px;
      border-left: 4px solid #4F46E5;
      line-height: 1.3;
    }

    .content h3 {
      font-size: 17px;
      font-weight: 700;
      color: #334155;
      margin: 32px 0 10px;
      line-height: 1.35;
    }

    .content h4 {
      font-size: 15px;
      font-weight: 600;
      color: #475569;
      margin: 24px 0 8px;
      line-height: 1.4;
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

    .content em { font-style: italic; }

    /* ===== Code ===== */
    .content code {
      font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono",
                   "Cascadia Code", Menlo, Consolas, monospace;
      font-size: 0.88em;
      background: #F1F5F9;
      color: #1E293B;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #E2E8F0;
    }

    .content pre {
      position: relative;
      background: #1E293B;
      border-radius: 10px;
      padding: 24px;
      margin: 0 0 24px;
      overflow-x: auto;
      break-inside: avoid;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .content pre code {
      background: none;
      padding: 0;
      border-radius: 0;
      border: none;
      font-size: 13px;
      line-height: 1.7;
      color: #E2E8F0;
    }

    /* highlight.js — dark theme for code blocks */
    .hljs { background: transparent; color: #E2E8F0; }
    .hljs-keyword { color: #C4B5FD; font-weight: 600; }
    .hljs-string { color: #6EE7B7; }
    .hljs-comment { color: #64748B; font-style: italic; }
    .hljs-number { color: #FCD34D; }
    .hljs-function .hljs-title,
    .hljs-title.function_ { color: #93C5FD; }
    .hljs-built_in { color: #67E8F9; }
    .hljs-attr { color: #C4B5FD; }
    .hljs-params { color: #CBD5E1; }
    .hljs-type { color: #C4B5FD; }
    .hljs-meta { color: #64748B; }
    .hljs-literal { color: #FCD34D; }
    .hljs-variable { color: #E2E8F0; }
    .hljs-property { color: #93C5FD; }
    .hljs-operator { color: #94A3B8; }
    .hljs-punctuation { color: #94A3B8; }

    /* ===== Tables ===== */
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 24px;
      font-size: 13px;
      break-inside: avoid;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
    }

    .content th {
      background: #4F46E5;
      font-weight: 600;
      text-align: left;
      padding: 12px 16px;
      border: none;
      color: #FFFFFF;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .content td {
      padding: 11px 16px;
      border-bottom: 1px solid #F1F5F9;
      color: #334155;
    }

    .content tr:nth-child(even) td { background: #F8FAFC; }
    .content tr:last-child td { border-bottom: none; }

    /* ===== Callout / Tip boxes ===== */
    .callout {
      display: flex;
      gap: 14px;
      border-radius: 10px;
      padding: 20px 24px;
      margin: 0 0 24px;
      break-inside: avoid;
      border: 1px solid;
    }

    .callout-icon {
      flex-shrink: 0;
      font-size: 18px;
      line-height: 1.5;
    }

    .callout-content {
      flex: 1;
      min-width: 0;
    }

    .callout-content p { margin: 0 0 8px; font-size: 13.5px; }
    .callout-content p:last-child { margin: 0; }

    .callout-note {
      background: #EEF2FF;
      border-color: #C7D2FE;
      color: #312E81;
    }

    .callout-tip {
      background: #F0FDF4;
      border-color: #BBF7D0;
      color: #14532D;
    }

    .callout-warning {
      background: #FFFBEB;
      border-color: #FDE68A;
      color: #78350F;
    }

    .callout-important {
      background: #FEF2F2;
      border-color: #FECACA;
      color: #7F1D1D;
    }

    .callout code {
      background: rgba(0, 0, 0, 0.06);
    }

    /* ===== Blockquotes (default — non-callout) ===== */
    .content blockquote {
      background: #F8FAFC;
      border-left: 4px solid #4F46E5;
      border-radius: 0 10px 10px 0;
      padding: 20px 24px;
      margin: 0 0 24px;
      color: #334155;
      font-size: 14px;
      font-style: italic;
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
      line-height: 1.7;
    }

    .content li > ul, .content li > ol { margin: 6px 0 0; }

    .content ul li::marker { color: #4F46E5; }
    .content ol li::marker { color: #4F46E5; font-weight: 600; }

    /* ===== Horizontal rules ===== */
    .content hr {
      border: none;
      border-top: 1px solid #E2E8F0;
      margin: 36px 0;
    }

    /* ===== Images ===== */
    .content img {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
      margin: 8px 0 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    /* ===== Back Cover ===== */
    .back-cover {
      break-before: page;
      page-break-before: always;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      text-align: center;
    }

    .back-cover-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .back-tagline {
      font-size: 14px;
      color: #64748B;
      letter-spacing: 0.5px;
      margin: 0;
    }

    .back-divider {
      width: 40px;
      height: 2px;
      background: #E2E8F0;
      margin: 8px 0;
    }

    .back-url {
      font-size: 16px;
      font-weight: 600;
      color: #4F46E5;
      letter-spacing: 1px;
      margin: 0;
    }

    /* ===== Print overrides ===== */
    @media print {
      body {
        max-width: none;
        padding: 0;
        font-size: 12px;
      }

      .cover-page {
        margin: 0;
        padding: 0;
        min-height: 100vh;
      }

      .toc {
        break-inside: avoid;
        page-break-after: always;
      }

      .content h1 { break-before: page; }
      .content h1:first-child { break-before: auto; }

      .content h2, .content h3, .content h4 {
        break-after: avoid;
      }

      .content pre, .content table, .content blockquote, .callout {
        break-inside: avoid;
      }

      .content a { color: #4F46E5; text-decoration: none; }
      .content a[href^="http"]::after {
        content: " (" attr(href) ")";
        font-size: 9px;
        color: #94A3B8;
        word-break: break-all;
      }
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
