import { createClient, type Client, type InArgs } from "@libsql/client";

let client: Client | null = null;

export function getClient(): Client {
  if (client) return client;

  client = createClient({
    url: process.env.TURSO_ECOMMERCE_DATABASE_URL || "file:data/store.db",
    authToken: process.env.TURSO_ECOMMERCE_AUTH_TOKEN,
  });

  return client;
}

export async function initializeDb(): Promise<void> {
  const db = getClient();

  await db.batch(
    [
      {
        sql: `CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT 'Admin',
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS login_attempts (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        ip_address TEXT NOT NULL DEFAULT '',
        success INTEGER NOT NULL DEFAULT 0,
        attempted_at TEXT DEFAULT (datetime('now'))
      )`,
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        short_description TEXT,
        price_cents INTEGER NOT NULL,
        compare_price_cents INTEGER,
        category TEXT NOT NULL,
        tags TEXT DEFAULT '[]',
        file_url TEXT,
        file_name TEXT,
        file_size_bytes INTEGER DEFAULT 0,
        preview_images TEXT DEFAULT '[]',
        thumbnail_url TEXT,
        stripe_price_id TEXT,
        status TEXT DEFAULT 'active',
        featured INTEGER DEFAULT 0,
        download_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        stripe_session_id TEXT UNIQUE,
        stripe_payment_intent TEXT,
        customer_email TEXT NOT NULL,
        customer_name TEXT,
        product_id TEXT REFERENCES products(id),
        amount_cents INTEGER NOT NULL,
        currency TEXT DEFAULT 'usd',
        status TEXT DEFAULT 'completed',
        download_token TEXT UNIQUE,
        download_count INTEGER DEFAULT 0,
        max_downloads INTEGER DEFAULT 3,
        token_expires_at TEXT,
        downloaded_at TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password_hash TEXT,
        password_reset_token TEXT,
        password_reset_expires TEXT,
        total_spent_cents INTEGER DEFAULT 0,
        order_count INTEGER DEFAULT 0,
        first_purchase_at TEXT,
        last_purchase_at TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS email_subscribers (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        source TEXT DEFAULT 'website',
        lead_magnet TEXT,
        subscribed_at TEXT DEFAULT (datetime('now')),
        unsubscribed_at TEXT,
        status TEXT NOT NULL DEFAULT 'active'
      )`,
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES orders(id),
        product_id TEXT NOT NULL REFERENCES products(id),
        price_cents INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
        args: [],
      },
      {
        sql: `CREATE TABLE IF NOT EXISTS downloads (
        id TEXT PRIMARY KEY,
        customer_id TEXT REFERENCES customers(id),
        product_id TEXT REFERENCES products(id),
        order_id TEXT REFERENCES orders(id),
        downloaded_at TEXT DEFAULT (datetime('now')),
        ip_address TEXT,
        user_agent TEXT
      )`,
        args: [],
      },
    ],
    "write",
  );

  // Migration: add payment_method to orders (stripe | paypal | crypto)
  try {
    await db.execute({
      sql: `ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'stripe'`,
      args: [],
    });
  } catch {
    // Column already exists — ignore
  }

  // Migration: add paypal_order_id to orders
  try {
    await db.execute({
      sql: `ALTER TABLE orders ADD COLUMN paypal_order_id TEXT`,
      args: [],
    });
  } catch {
    // Column already exists — ignore
  }

  // Migration: add customer_id to orders if not present
  try {
    await db.execute({
      sql: `ALTER TABLE orders ADD COLUMN customer_id TEXT REFERENCES customers(id)`,
      args: [],
    });
  } catch {
    // Column already exists — ignore
  }

  // Migration: add password_hash to customers if not present (for existing DBs)
  try {
    await db.execute({
      sql: `ALTER TABLE customers ADD COLUMN password_hash TEXT`,
      args: [],
    });
  } catch {
    // Column already exists — ignore
  }
  try {
    await db.execute({
      sql: `ALTER TABLE customers ADD COLUMN password_reset_token TEXT`,
      args: [],
    });
  } catch {
    // ignore
  }
  try {
    await db.execute({
      sql: `ALTER TABLE customers ADD COLUMN password_reset_expires TEXT`,
      args: [],
    });
  } catch {
    // ignore
  }
  try {
    await db.execute({
      sql: `ALTER TABLE customers ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))`,
      args: [],
    });
  } catch {
    // ignore
  }

  // Migration: add status to email_subscribers
  try {
    await db.execute({
      sql: `ALTER TABLE email_subscribers ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`,
      args: [],
    });
  } catch {
    // Column already exists
  }

  // Migration: add refunded_at to orders
  try {
    await db.execute({
      sql: `ALTER TABLE orders ADD COLUMN refunded_at TEXT`,
      args: [],
    });
  } catch {
    // Column already exists
  }

  // Migration: add stripe_product_id to products if not present
  try {
    await db.execute({
      sql: `ALTER TABLE products ADD COLUMN stripe_product_id TEXT`,
      args: [],
    });
  } catch {
    // Column already exists
  }

  // Migration: add preview_url to products for PDF preview links
  try {
    await db.execute({
      sql: `ALTER TABLE products ADD COLUMN preview_url TEXT`,
      args: [],
    });
  } catch {
    // Column already exists
  }

  // Create indexes for frequently queried columns
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)",
    "CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)",
    "CREATE INDEX IF NOT EXISTS idx_downloads_customer_id ON downloads(customer_id)",
    "CREATE INDEX IF NOT EXISTS idx_downloads_product_id ON downloads(product_id)",
    "CREATE INDEX IF NOT EXISTS idx_downloads_order_id ON downloads(order_id)",
    "CREATE INDEX IF NOT EXISTS idx_downloads_downloaded_at ON downloads(downloaded_at)",
    "CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)",
    "CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id)",
    "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)",
    "CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)",
    "CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON email_subscribers(status)",
    "CREATE INDEX IF NOT EXISTS idx_email_subscribers_source ON email_subscribers(source)",
    "CREATE INDEX IF NOT EXISTS idx_email_subscribers_subscribed_at ON email_subscribers(subscribed_at)",
  ];
  for (const idx of indexes) {
    try {
      await db.execute({ sql: idx, args: [] });
    } catch {
      // Index may already exist
    }
  }

  // Migration: create email_history table for tracking sent emails
  try {
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS email_history (
        id TEXT PRIMARY KEY,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'sent',
        resend_id TEXT,
        error TEXT,
        sent_at TEXT DEFAULT (datetime('now'))
      )`,
      args: [],
    });
  } catch {
    // Table may already exist
  }

  // Check if products table is empty; if so, seed it
  const result = await db.execute({
    sql: "SELECT COUNT(*) as count FROM products",
    args: [],
  });
  const count = Number((result.rows[0] as unknown as { count: number }).count);
  if (count === 0) {
    await seedProducts();
  }

  // Seed/upsert admin user when BOTH env vars are explicitly set (CI/production headless setup).
  // If neither is set, skip seeding so the interactive setup endpoint can handle first-admin creation.
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    await seedAdminUser();
  }

  // NOTE: Stale seedStripeIds() removed — those were test-mode Stripe IDs.
  // Use POST /api/admin/products/sync-stripe to populate live Stripe IDs.
}

// Ensure schema is initialized (called lazily)
let initPromise: Promise<void> | null = null;

export async function ensureDb(): Promise<Client> {
  const db = getClient();
  if (!initPromise) {
    initPromise = initializeDb();
  }
  await initPromise;
  return db;
}

// Helper: execute a query and return all rows
export async function queryAll<T = Record<string, unknown>>(
  sql: string,
  args: InArgs = [],
): Promise<T[]> {
  const db = await ensureDb();
  const result = await db.execute({ sql, args });
  return result.rows as unknown as T[];
}

// Helper: execute a query and return the first row
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  args: InArgs = [],
): Promise<T | undefined> {
  const db = await ensureDb();
  const result = await db.execute({ sql, args });
  return result.rows[0] as unknown as T | undefined;
}

// Helper: execute a write query (INSERT, UPDATE, DELETE)
export async function execute(sql: string, args: InArgs = []) {
  const db = await ensureDb();
  return db.execute({ sql, args });
}

async function seedAdminUser() {
  // Only called when both ADMIN_EMAIL and ADMIN_PASSWORD env vars are set.
  // Uses an UPSERT pattern: if an admin already exists, update their credentials;
  // if no admin exists, create one. This ensures setting env vars on Vercel
  // always works even if an admin already exists.
  const bcrypt = await import("bcryptjs");
  const db = getClient();

  const email = process.env.ADMIN_EMAIL!.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD!;

  const passwordHash = await bcrypt.hash(password, 10);

  // Check if any admin exists
  const result = await db.execute({
    sql: "SELECT id FROM admin_users ORDER BY created_at ASC LIMIT 1",
    args: [],
  });

  if (result.rows.length > 0) {
    // Update the first admin's credentials
    const existingId = (result.rows[0] as unknown as { id: string }).id;
    await db.execute({
      sql: `UPDATE admin_users SET email = ?, password_hash = ?, updated_at = datetime('now') WHERE id = ?`,
      args: [email, passwordHash, existingId],
    });
  } else {
    // No admin exists — insert a new one
    const id = crypto.randomUUID();
    await db.execute({
      sql: `INSERT INTO admin_users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`,
      args: [id, email, passwordHash, "Admin", "admin"],
    });
  }
}

// seedStripeIds() removed — contained stale test-mode Stripe IDs.
// Live Stripe IDs are populated via POST /api/admin/products/sync-stripe.

async function seedProducts() {
  const db = getClient();

  const products = [
    {
      id: "prod_001",
      name: "Ultimate Budget Spreadsheet Pack",
      slug: "ultimate-budget-spreadsheet-pack",
      description: `# Ultimate Budget Spreadsheet Pack

Take control of your finances with 7 professionally designed spreadsheets that cover every aspect of personal finance management.

## What's Included

- **Monthly Budget Tracker** — Track income and expenses with auto-categorization
- **Debt Snowball Calculator** — Visualize your debt-free journey with payment schedules
- **Investment Portfolio Tracker** — Monitor stocks, crypto, and retirement accounts
- **Net Worth Calculator** — See your complete financial picture at a glance
- **Emergency Fund Tracker** — Set goals and track progress toward your safety net
- **50/30/20 Budget Template** — The simplest framework for balanced spending
- **Annual Financial Review** — Year-end summary with charts and insights

## Features

- Works in Google Sheets and Microsoft Excel
- Auto-calculating formulas — just enter your numbers
- Clean, professional design with conditional formatting
- Mobile-friendly for on-the-go tracking
- Video walkthrough included for each spreadsheet

Perfect for beginners and experienced budgeters alike. Start building wealth today.`,
      short_description:
        "7 professionally designed spreadsheets: monthly budget, debt snowball, investment tracker, net worth calculator, emergency fund tracker, 50/30/20 template, and annual financial review.",
      price_cents: 1299,
      compare_price_cents: 2499,
      category: "finance-templates",
      tags: '["spreadsheet","budget","finance","excel","google-sheets"]',
      thumbnail_url:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
      featured: 1,
      status: "active",
    },
    {
      id: "prod_002",
      name: "AI Prompt Engineering Masterclass Pack",
      slug: "ai-prompt-engineering-masterclass",
      description: `# AI Prompt Engineering Masterclass Pack

Master the art of AI prompting with 200+ battle-tested prompts that deliver consistent, high-quality results across all major AI platforms.

## What's Included

- **Writing Prompts (40+)** — Blog posts, copywriting, creative writing, editing
- **Coding Prompts (35+)** — Debug, refactor, explain, generate, review
- **Analysis Prompts (30+)** — Data analysis, research summaries, competitor analysis
- **Marketing Prompts (35+)** — Ad copy, email campaigns, social media, SEO
- **Business Strategy (30+)** — Business plans, SWOT analysis, market research
- **Productivity (30+)** — Meeting summaries, email drafts, task breakdowns

## Why This Pack?

- Works with ChatGPT, Claude, and Gemini
- Each prompt includes context variables you can customize
- Organized by use case with difficulty ratings
- Copy-paste ready — no prompt engineering knowledge needed
- Includes a "Prompt Engineering 101" guide

Stop getting mediocre AI outputs. Start getting exceptional ones.`,
      short_description:
        "200+ battle-tested prompts for ChatGPT, Claude, and Gemini. Organized by use case: writing, coding, analysis, marketing, business strategy. Copy-paste ready.",
      price_cents: 2499,
      compare_price_cents: null,
      category: "prompt-packs",
      tags: '["ai","prompts","chatgpt","claude","productivity"]',
      thumbnail_url:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
      featured: 1,
      status: "active",
    },
    {
      id: "prod_003",
      name: "Notion Second Brain Starter Kit",
      slug: "notion-second-brain-starter-kit",
      description: `# Notion Second Brain Starter Kit

Build your personal knowledge management system with this complete Notion workspace. Stop losing ideas and start organizing your life.

## What's Included

- **Daily Planner** — Time-blocked schedule with priorities and energy tracking
- **Project Tracker** — Kanban boards, timelines, and progress dashboards
- **Reading List** — Track books, articles, and highlights with ratings
- **Habit Tracker** — Visual streaks, weekly reviews, and habit scoring
- **Goal Setting Dashboard** — OKRs, milestones, and quarterly reviews
- **Weekly Review Template** — Reflect, plan, and improve every week

## Features

- One-click duplicate to your Notion workspace
- Mobile-optimized layouts
- Linked databases for seamless navigation
- Custom properties and filters pre-configured
- Dark mode compatible
- Setup video walkthrough included

Your second brain is one click away. Duplicate and start organizing.`,
      short_description:
        "Complete Notion workspace: daily planner, project tracker, reading list, habit tracker, goal setting dashboard, and weekly review template. Duplicate and start organizing.",
      price_cents: 1499,
      compare_price_cents: 2999,
      category: "notion-templates",
      tags: '["notion","productivity","organization","planner"]',
      thumbnail_url:
        "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop",
      featured: 1,
      status: "active",
    },
    {
      id: "prod_004",
      name: "Smart Home Setup Blueprint",
      slug: "smart-home-setup-blueprint",
      description: `# Smart Home Setup Blueprint

Transform your house into a smart home with this comprehensive room-by-room guide. No tech expertise required.

## What's Included

- **Room-by-Room Guides** — Living room, bedroom, kitchen, bathroom, garage, outdoor
- **Equipment Checklist** — Curated product recommendations at every price point
- **Budget Calculator** — Plan your smart home investment by room and priority
- **Automation Recipes** — 50+ routines for morning, evening, away, and guest modes
- **Troubleshooting Guide** — Common issues and fixes for every major platform

## Covers

- Smart lighting (Hue, LIFX, Nanoleaf)
- Security cameras and doorbells
- Voice assistants (Alexa, Google, Siri)
- Motion and door sensors
- Smart thermostats
- Entertainment systems

Start with one room or go all-in. This blueprint scales with your ambition.`,
      short_description:
        "Room-by-room guide to automating your home. Covers: lighting, security cameras, voice assistants, sensors, and routines. Includes equipment checklist and budget calculator.",
      price_cents: 999,
      compare_price_cents: null,
      category: "smart-home-guides",
      tags: '["smart-home","automation","iot","guide"]',
      thumbnail_url:
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop",
      featured: 0,
      status: "active",
    },
    {
      id: "prod_005",
      name: "Developer Portfolio Template",
      slug: "developer-portfolio-template",
      description: `# Developer Portfolio Template

Land your dream dev job with a stunning portfolio site. Built with Astro and Tailwind CSS for blazing-fast performance.

## What's Included

- **Full Source Code** — Astro + Tailwind CSS, fully customizable
- **5 Page Layouts** — Home, About, Projects, Blog, Contact
- **Dark Mode** — Automatic and manual toggle
- **Project Showcase** — Filterable grid with live demos and GitHub links
- **Blog System** — Markdown-based with syntax highlighting
- **Contact Form** — Working form with spam protection
- **SEO Optimized** — Meta tags, Open Graph, structured data, sitemap

## Features

- 100/100 Lighthouse score
- Responsive on all devices
- Animations and micro-interactions
- Easy content management via markdown files
- Deploy to Vercel, Netlify, or Cloudflare Pages in 5 minutes
- Detailed setup documentation

Your portfolio is your first impression. Make it count.`,
      short_description:
        "Astro + Tailwind portfolio site. Dark mode, project showcase, blog, contact form, SEO optimized. Deploy to Vercel in 5 minutes.",
      price_cents: 1999,
      compare_price_cents: 3999,
      category: "dev-templates",
      tags: '["portfolio","developer","astro","tailwind","template"]',
      thumbnail_url:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      featured: 1,
      status: "active",
    },
    {
      id: "prod_006",
      name: "Content Creator Prompt Bible",
      slug: "content-creator-prompt-bible",
      description: `# Content Creator Prompt Bible

Never stare at a blank screen again. 150+ AI prompts designed specifically for content creators across every major platform.

## What's Included

- **Social Media (40+ prompts)** — Twitter threads, LinkedIn posts, Instagram captions
- **Blog Writing (30+ prompts)** — Outlines, drafts, SEO optimization, headlines
- **Email Marketing (25+ prompts)** — Welcome sequences, newsletters, sales emails
- **YouTube Scripts (25+ prompts)** — Hooks, outlines, CTAs, descriptions
- **Podcast Outlines (15+ prompts)** — Episode structures, interview questions, show notes
- **Platform Templates** — Optimized formats for each social platform

## Why Creators Love It

- Saves 5-10 hours per week on content creation
- Maintains your unique voice (customizable tone settings)
- Includes content calendar planning prompts
- A/B testing prompts for optimizing engagement
- Works with ChatGPT, Claude, and Gemini

Create more. Stress less. Let AI handle the heavy lifting.`,
      short_description:
        "150+ prompts for social media, blog posts, email marketing, YouTube scripts, and podcast outlines. Includes platform-specific templates for Twitter, LinkedIn, Instagram.",
      price_cents: 1799,
      compare_price_cents: null,
      category: "prompt-packs",
      tags: '["content","social-media","prompts","marketing","creator"]',
      thumbnail_url:
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop",
      featured: 0,
      status: "active",
    },
    {
      id: "prod_007",
      name: "50/30/20 Budget Template",
      slug: "50-30-20-budget-template",
      description: `# 50/30/20 Budget Template

The simplest, most effective budget you'll ever use. Based on the proven 50/30/20 rule: 50% needs, 30% wants, 20% savings.

## What's Included

- **Main Budget Sheet** — Auto-calculates your ideal split based on income
- **Expense Tracker** — Categorizes spending into needs, wants, and savings
- **Monthly Summary** — Visual breakdown with charts
- **Annual Overview** — Track your progress over 12 months
- **Video Walkthrough** — Step-by-step setup guide (15 minutes)

## Features

- Works in Google Sheets AND Microsoft Excel
- Auto-calculating formulas — just enter income and expenses
- Color-coded categories for quick scanning
- Built-in alerts when you're over budget
- Print-friendly monthly summary

## Why 50/30/20?

It's the budget that actually sticks. No 47 categories. No obsessive tracking. Just three buckets and a clear picture of where your money goes.

Start in under 5 minutes. Budget like a pro.`,
      short_description:
        "The simplest budget you'll ever use. Auto-calculates your needs/wants/savings split. Works in Google Sheets and Excel. Includes video walkthrough.",
      price_cents: 499,
      compare_price_cents: 999,
      category: "finance-templates",
      tags: '["budget","spreadsheet","finance","simple"]',
      thumbnail_url:
        "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop",
      featured: 0,
      status: "active",
    },
    {
      id: "prod_008",
      name: "Printable Planner Bundle 2026",
      slug: "printable-planner-bundle-2026",
      description: `# Printable Planner Bundle 2026

Everything you need to plan, track, and crush your goals in 2026. Print at home or at your local print shop.

## What's Included

- **12 Monthly Calendars** — Monday and Sunday start options
- **52 Weekly Planners** — Time-blocked with priority sections
- **365 Daily Planners** — Hourly schedule, top 3 priorities, notes
- **Habit Tracker** — 12-month visual tracker for up to 10 habits
- **Goal Worksheets** — Quarterly goal setting with action steps
- **Meal Planner** — Weekly meal planning with grocery list
- **Gratitude Journal** — Daily prompts for reflection and gratitude

## Specifications

- Available in A4 and US Letter sizes
- High-resolution PDF files (300 DPI)
- Black and white design (saves ink!)
- Clean, minimal aesthetic
- Hole-punch compatible margins

## How to Use

1. Download the PDF bundle
2. Print at home or at a print shop
3. Bind, hole-punch, or use loose-leaf
4. Plan your best year yet

Simple. Beautiful. Effective.`,
      short_description:
        "12 months of daily, weekly, and monthly planners. Plus: habit tracker, goal worksheets, meal planner, and gratitude journal. A4 and Letter sizes included.",
      price_cents: 799,
      compare_price_cents: 1499,
      category: "printables",
      tags: '["planner","printable","2026","productivity","journal"]',
      thumbnail_url:
        "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=400&fit=crop",
      featured: 0,
      status: "active",
    },
    {
      id: "prod_009",
      name: "AI Coding Assistant Prompt Pack",
      slug: "ai-coding-assistant-prompt-pack",
      description: `# AI Coding Assistant Prompt Pack

Level up your development workflow with 100+ prompts specifically designed for coding with AI assistants.

## What's Included

- **Debugging (20+ prompts)** — Systematic error diagnosis, stack trace analysis, edge case identification
- **Refactoring (15+ prompts)** — Code cleanup, performance optimization, pattern application
- **Testing (15+ prompts)** — Unit tests, integration tests, edge cases, mocking strategies
- **Documentation (15+ prompts)** — README generation, API docs, inline comments, changelogs
- **Code Review (15+ prompts)** — Security audit, performance review, best practices check
- **Architecture (10+ prompts)** — System design, database schema, API design, scaling decisions
- **Learning (10+ prompts)** — Explain concepts, compare approaches, teach patterns

## Supported AI Tools

- Claude (Anthropic)
- ChatGPT (OpenAI)
- GitHub Copilot
- Cursor
- Any AI coding assistant

## Why Developers Love It

- Save 2-4 hours daily on routine coding tasks
- Get better AI outputs with structured prompts
- Learn best practices through AI-guided reviews
- Includes prompt chaining techniques for complex tasks

Write better code. Ship faster. Let AI handle the grunt work.`,
      short_description:
        "100+ prompts specifically for coding with AI. Debug, refactor, write tests, generate docs, code review, architecture decisions. Works with Claude, ChatGPT, Copilot.",
      price_cents: 2999,
      compare_price_cents: null,
      category: "prompt-packs",
      tags: '["coding","developer","ai","prompts","productivity"]',
      thumbnail_url:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
      featured: 0,
      status: "active",
    },
    {
      id: "prod_010",
      name: "Privacy-First Smart Home Guide",
      slug: "privacy-first-smart-home-guide",
      description: `# Privacy-First Smart Home Guide

Build a powerful smart home WITHOUT sending your data to Big Tech. 100% local control, zero cloud dependency.

## What's Included

- **Home Assistant Setup Guide** — From installation to advanced automations
- **Zigbee Network Guide** — Build a reliable mesh network with local control
- **Z-Wave Integration** — Device selection and configuration
- **Local Voice Control** — Rhasspy and other privacy-respecting voice assistants
- **Network Security** — VLAN setup, firewall rules, IoT isolation
- **Device Recommendations** — 50+ tested devices that work locally

## Topics Covered

- Why cloud-dependent smart homes are a privacy risk
- Setting up Home Assistant on a Raspberry Pi or mini PC
- Zigbee2MQTT vs ZHA — which to choose
- Creating automations without cloud services
- Local cameras with Frigate NVR
- Blocking IoT devices from phoning home

## Who This Is For

- Privacy-conscious homeowners
- Tech enthusiasts who want full control
- Anyone tired of "cloud service discontinued" emails
- People who want smart home reliability without internet dependency

Your home. Your data. Your rules.`,
      short_description:
        "Build a smart home WITHOUT giving your data to Big Tech. Local-only solutions: Home Assistant, Zigbee, Z-Wave. No cloud required.",
      price_cents: 1299,
      compare_price_cents: null,
      category: "smart-home-guides",
      tags: '["smart-home","privacy","home-assistant","local","security"]',
      thumbnail_url:
        "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&h=400&fit=crop",
      featured: 0,
      status: "active",
    },
    {
      id: "prod_011",
      name: "SaaS Landing Page Template",
      slug: "saas-landing-page-template",
      description: `# SaaS Landing Page Template

Launch your SaaS product with a conversion-optimized landing page. Built with Next.js and Tailwind CSS.

## What's Included

- **Hero Section** — Headline, subheadline, CTA, and product screenshot
- **Features Grid** — Icon-based feature showcase with descriptions
- **Pricing Table** — 3-tier pricing with monthly/annual toggle
- **Testimonials** — Rotating testimonial cards with avatars
- **FAQ Section** — Accordion-style frequently asked questions
- **CTA Sections** — Multiple conversion points throughout the page
- **Footer** — Links, newsletter signup, social icons

## Technical Features

- Next.js 14 with App Router
- Tailwind CSS with custom design tokens
- Dark and light theme support
- Stripe integration ready (pricing table wired up)
- SEO optimized with meta tags and Open Graph
- 100/100 Lighthouse performance score
- Fully responsive design

## Quick Start

1. Clone the repository
2. Update content in the config file
3. Add your Stripe keys
4. Deploy to Vercel

Go from idea to live landing page in under an hour.`,
      short_description:
        "Next.js + Tailwind landing page with: hero, features, pricing table, testimonials, FAQ, CTA sections. Stripe-ready. Dark and light themes.",
      price_cents: 2499,
      compare_price_cents: 4999,
      category: "dev-templates",
      tags: '["saas","landing-page","nextjs","tailwind","template"]',
      thumbnail_url:
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop",
      featured: 0,
      status: "active",
    },
    {
      id: "prod_012",
      name: "Midjourney Prompt Encyclopedia",
      slug: "midjourney-prompt-encyclopedia",
      description: `# Midjourney Prompt Encyclopedia

The most comprehensive collection of Midjourney prompts available. 500+ prompts organized by style, with modifiers and parameters explained.

## What's Included

- **Photorealistic (80+ prompts)** — Portraits, landscapes, product shots, food photography
- **Anime & Manga (60+ prompts)** — Character design, scenes, backgrounds, chibi
- **Oil Painting (50+ prompts)** — Classical, impressionist, modern, abstract
- **3D Render (60+ prompts)** — Isometric, product visualization, characters, environments
- **Architectural (50+ prompts)** — Interior design, exterior, futuristic, minimal
- **Digital Art (70+ prompts)** — Concept art, illustrations, icons, UI elements
- **Abstract (50+ prompts)** — Patterns, textures, generative, geometric
- **Mixed Styles (80+ prompts)** — Combining techniques for unique results

## Bonus Content

- Complete aspect ratio guide
- Style modifier reference (200+ modifiers)
- Negative prompt library
- Parameter cheat sheet (--v, --ar, --s, --q, --c)
- Before/after examples showing prompt refinement

## Regular Updates

This encyclopedia is updated quarterly with new prompts and techniques as Midjourney evolves.

Create stunning AI art. Every time.`,
      short_description:
        "500+ Midjourney prompts organized by style: photorealistic, anime, oil painting, 3D render, architectural. Includes aspect ratios, style modifiers, and negative prompts.",
      price_cents: 1999,
      compare_price_cents: 3499,
      category: "prompt-packs",
      tags: '["midjourney","ai-art","prompts","design","creative"]',
      thumbnail_url:
        "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&h=400&fit=crop",
      featured: 0,
      status: "active",
    },
  ];

  const statements = products.map((p) => ({
    sql: `INSERT INTO products (id, name, slug, description, short_description, price_cents, compare_price_cents, category, tags, thumbnail_url, featured, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      p.id,
      p.name,
      p.slug,
      p.description,
      p.short_description,
      p.price_cents,
      p.compare_price_cents,
      p.category,
      p.tags,
      p.thumbnail_url,
      p.featured,
      p.status,
    ],
  }));

  await db.batch(statements, "write");
}
