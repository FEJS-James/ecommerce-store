/**
 * Strip markdown syntax from text, returning plain readable text.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s?/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^[-*]\s/gm, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Return a short plain-text excerpt from a potentially markdown-rich string.
 */
export function getExcerpt(text: string, maxLength = 150): string {
  const clean = stripMarkdown(text);
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength).replace(/\s\S*$/, "") + "...";
}

/**
 * Split markdown into paragraphs for clean rendering without a markdown library.
 * Returns an array of { type, text } objects.
 */
export function parseMarkdownSimple(
  text: string,
): Array<{ type: "heading" | "bullet" | "paragraph"; text: string }> {
  const lines = text.split("\n");
  const result: Array<{
    type: "heading" | "bullet" | "paragraph";
    text: string;
  }> = [];

  let paragraphBuffer = "";

  const flushParagraph = () => {
    const trimmed = paragraphBuffer.trim();
    if (trimmed) {
      result.push({ type: "paragraph", text: inlineClean(trimmed) });
    }
    paragraphBuffer = "";
  };

  const inlineClean = (s: string): string =>
    s
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .trim();

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      flushParagraph();
      result.push({ type: "heading", text: inlineClean(headingMatch[2]) });
      continue;
    }

    const bulletMatch = line.match(/^[-*]\s+(.*)/);
    if (bulletMatch) {
      flushParagraph();
      result.push({ type: "bullet", text: inlineClean(bulletMatch[1]) });
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      continue;
    }

    paragraphBuffer += (paragraphBuffer ? " " : "") + line;
  }
  flushParagraph();

  return result;
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(cents) / 100);
}

/**
 * Safely convert a date value (Date, number, or string) to a Date object.
 */
export function safeDate(
  value: Date | number | string | null | undefined,
): Date {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  return new Date(String(value));
}

export function formatDate(dateStr: Date | number | string): string {
  return safeDate(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: Date | number | string): string {
  return safeDate(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export const CATEGORIES: Record<
  string,
  { label: string; iconName: string; description: string }
> = {
  "finance-templates": {
    label: "Finance Templates",
    iconName: "TrendingUp",
    description: "Spreadsheets and tools to manage your money",
  },
  "prompt-packs": {
    label: "AI Prompt Packs",
    iconName: "BrainCircuit",
    description: "Battle-tested prompts for every AI platform",
  },
  "notion-templates": {
    label: "Notion Templates",
    iconName: "LayoutGrid",
    description: "Ready-to-use Notion workspaces and systems",
  },
  "smart-home-guides": {
    label: "Smart Home Guides",
    iconName: "Home",
    description: "Step-by-step guides to automate your home",
  },
  "dev-templates": {
    label: "Developer Templates",
    iconName: "Code2",
    description: "Production-ready code templates and starters",
  },
  printables: {
    label: "Printables",
    iconName: "Printer",
    description: "Beautiful printable planners and worksheets",
  },
};

export const CATEGORY_FAQS: Record<
  string,
  Array<{ question: string; answer: string }>
> = {
  "finance-templates": [
    {
      question: "What software do I need?",
      answer:
        "Our templates work with Google Sheets (free) and Microsoft Excel. No special software required.",
    },
    {
      question: "Can I customize the templates?",
      answer:
        "Absolutely! All cells are unlocked and fully editable. Change colors, add categories, modify formulas — make it yours.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes, we offer a 30-day money-back guarantee. If the templates don't work for you, email us for a full refund.",
    },
    {
      question: "Are updates included?",
      answer:
        "Yes! When we update a template, you get the new version free. Check your download link for the latest version.",
    },
  ],
  "prompt-packs": [
    {
      question: "Which AI tools do these work with?",
      answer:
        "Our prompts are tested with ChatGPT, Claude, Gemini, and most other AI assistants. They work across platforms.",
    },
    {
      question: "How do I use the prompts?",
      answer:
        "Simply copy a prompt, replace the bracketed variables with your specific details, and paste into your AI tool of choice.",
    },
    {
      question: "Will these work with future AI models?",
      answer:
        "Prompt engineering principles are consistent across models. While we update for new features, the core prompts will continue to work.",
    },
    {
      question: "Can I use these commercially?",
      answer:
        "Yes! Use the AI outputs generated from our prompts for any personal or commercial purpose.",
    },
  ],
  "notion-templates": [
    {
      question: "How do I add this to my Notion?",
      answer:
        'Click the "Duplicate" button on the template page and it will be copied to your Notion workspace instantly.',
    },
    {
      question: "Do I need Notion Pro?",
      answer:
        "No, our templates work with the free Notion plan. Some advanced features may benefit from a paid plan.",
    },
    {
      question: "Can I customize the template?",
      answer:
        "Yes! Once duplicated, you have full control. Edit properties, views, layouts — everything is customizable.",
    },
    {
      question: "Is there a setup guide?",
      answer:
        'Each template includes a detailed "Getting Started" page with step-by-step instructions and a video walkthrough.',
    },
  ],
  "smart-home-guides": [
    {
      question: "Do I need technical experience?",
      answer:
        "No! Our guides are written for beginners. We explain every step with screenshots and diagrams.",
    },
    {
      question: "What smart home platform do you recommend?",
      answer:
        "It depends on your needs. Our guides cover multiple platforms and help you choose the right one for your situation.",
    },
    {
      question: "How much will the hardware cost?",
      answer:
        "Each guide includes a budget calculator. You can start with as little as $50-100 for a single room.",
    },
    {
      question: "Do you update the guides?",
      answer:
        "Yes, guides are updated quarterly to reflect new products, firmware updates, and best practices.",
    },
  ],
  "dev-templates": [
    {
      question: "What technologies are used?",
      answer:
        "Each template lists its tech stack in the description. We use modern, well-supported frameworks like Next.js, Astro, and Tailwind CSS.",
    },
    {
      question: "Can I use this for client projects?",
      answer:
        "Yes! Our license allows unlimited personal and commercial use. Build as many projects as you want.",
    },
    {
      question: "Is support included?",
      answer:
        "Each template includes detailed documentation. For additional help, reach out via email and we'll help you get set up.",
    },
    {
      question: "How do I deploy?",
      answer:
        "All templates include deployment guides for popular platforms like Vercel, Netlify, and Cloudflare Pages.",
    },
  ],
  printables: [
    {
      question: "What paper size should I use?",
      answer:
        "Both A4 and US Letter sizes are included in every download. Choose the one that matches your printer.",
    },
    {
      question: "Can I print these at a print shop?",
      answer:
        "Yes! The files are high-resolution PDFs (300 DPI) that work perfectly at professional print shops.",
    },
    {
      question: "Is this a one-time purchase?",
      answer:
        "Yes! Pay once, print unlimited copies for personal use. No subscription required.",
    },
    {
      question: "Are the files editable?",
      answer:
        "The PDFs are designed for printing as-is. If you need editable versions, reach out and we can help.",
    },
  ],
};
