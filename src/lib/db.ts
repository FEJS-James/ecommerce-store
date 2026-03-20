import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'store.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initializeSchema(db);
  return db;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
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
    );

    CREATE TABLE IF NOT EXISTS orders (
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
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      total_spent_cents INTEGER DEFAULT 0,
      order_count INTEGER DEFAULT 0,
      first_purchase_at TEXT,
      last_purchase_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS email_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      source TEXT DEFAULT 'website',
      lead_magnet TEXT,
      subscribed_at TEXT DEFAULT (datetime('now')),
      unsubscribed_at TEXT
    );
  `);

  // Check if products table is empty; if so, seed it
  const count = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (count.count === 0) {
    seedProducts(db);
  }
}

function seedProducts(db: Database.Database) {
  const products = [
    {
      id: 'prod_001',
      name: 'Ultimate Budget Spreadsheet Pack',
      slug: 'ultimate-budget-spreadsheet-pack',
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
      short_description: '7 professionally designed spreadsheets: monthly budget, debt snowball, investment tracker, net worth calculator, emergency fund tracker, 50/30/20 template, and annual financial review.',
      price_cents: 1299,
      compare_price_cents: 2499,
      category: 'finance-templates',
      tags: '["spreadsheet","budget","finance","excel","google-sheets"]',
      thumbnail_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop',
      featured: 1,
      status: 'active',
    },
    {
      id: 'prod_002',
      name: 'AI Prompt Engineering Masterclass Pack',
      slug: 'ai-prompt-engineering-masterclass',
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
      short_description: '200+ battle-tested prompts for ChatGPT, Claude, and Gemini. Organized by use case: writing, coding, analysis, marketing, business strategy. Copy-paste ready.',
      price_cents: 2499,
      compare_price_cents: null,
      category: 'prompt-packs',
      tags: '["ai","prompts","chatgpt","claude","productivity"]',
      thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
      featured: 1,
      status: 'active',
    },
    {
      id: 'prod_003',
      name: 'Notion Second Brain Starter Kit',
      slug: 'notion-second-brain-starter-kit',
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
      short_description: 'Complete Notion workspace: daily planner, project tracker, reading list, habit tracker, goal setting dashboard, and weekly review template. Duplicate and start organizing.',
      price_cents: 1499,
      compare_price_cents: 2999,
      category: 'notion-templates',
      tags: '["notion","productivity","organization","planner"]',
      thumbnail_url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop',
      featured: 1,
      status: 'active',
    },
    {
      id: 'prod_004',
      name: 'Smart Home Setup Blueprint',
      slug: 'smart-home-setup-blueprint',
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
      short_description: 'Room-by-room guide to automating your home. Covers: lighting, security cameras, voice assistants, sensors, and routines. Includes equipment checklist and budget calculator.',
      price_cents: 999,
      compare_price_cents: null,
      category: 'smart-home-guides',
      tags: '["smart-home","automation","iot","guide"]',
      thumbnail_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop',
      featured: 0,
      status: 'active',
    },
    {
      id: 'prod_005',
      name: 'Developer Portfolio Template',
      slug: 'developer-portfolio-template',
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
      short_description: 'Astro + Tailwind portfolio site. Dark mode, project showcase, blog, contact form, SEO optimized. Deploy to Vercel in 5 minutes.',
      price_cents: 1999,
      compare_price_cents: 3999,
      category: 'dev-templates',
      tags: '["portfolio","developer","astro","tailwind","template"]',
      thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      featured: 1,
      status: 'active',
    },
    {
      id: 'prod_006',
      name: 'Content Creator Prompt Bible',
      slug: 'content-creator-prompt-bible',
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
      short_description: '150+ prompts for social media, blog posts, email marketing, YouTube scripts, and podcast outlines. Includes platform-specific templates for Twitter, LinkedIn, Instagram.',
      price_cents: 1799,
      compare_price_cents: null,
      category: 'prompt-packs',
      tags: '["content","social-media","prompts","marketing","creator"]',
      thumbnail_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
      featured: 0,
      status: 'active',
    },
    {
      id: 'prod_007',
      name: '50/30/20 Budget Template',
      slug: '50-30-20-budget-template',
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
      short_description: "The simplest budget you'll ever use. Auto-calculates your needs/wants/savings split. Works in Google Sheets and Excel. Includes video walkthrough.",
      price_cents: 499,
      compare_price_cents: 999,
      category: 'finance-templates',
      tags: '["budget","spreadsheet","finance","simple"]',
      thumbnail_url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=400&fit=crop',
      featured: 0,
      status: 'active',
    },
    {
      id: 'prod_008',
      name: 'Printable Planner Bundle 2026',
      slug: 'printable-planner-bundle-2026',
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
      short_description: '12 months of daily, weekly, and monthly planners. Plus: habit tracker, goal worksheets, meal planner, and gratitude journal. A4 and Letter sizes included.',
      price_cents: 799,
      compare_price_cents: 1499,
      category: 'printables',
      tags: '["planner","printable","2026","productivity","journal"]',
      thumbnail_url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=400&fit=crop',
      featured: 0,
      status: 'active',
    },
    {
      id: 'prod_009',
      name: 'AI Coding Assistant Prompt Pack',
      slug: 'ai-coding-assistant-prompt-pack',
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
      short_description: '100+ prompts specifically for coding with AI. Debug, refactor, write tests, generate docs, code review, architecture decisions. Works with Claude, ChatGPT, Copilot.',
      price_cents: 2999,
      compare_price_cents: null,
      category: 'prompt-packs',
      tags: '["coding","developer","ai","prompts","productivity"]',
      thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
      featured: 0,
      status: 'active',
    },
    {
      id: 'prod_010',
      name: 'Privacy-First Smart Home Guide',
      slug: 'privacy-first-smart-home-guide',
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
      short_description: 'Build a smart home WITHOUT giving your data to Big Tech. Local-only solutions: Home Assistant, Zigbee, Z-Wave. No cloud required.',
      price_cents: 1299,
      compare_price_cents: null,
      category: 'smart-home-guides',
      tags: '["smart-home","privacy","home-assistant","local","security"]',
      thumbnail_url: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&h=400&fit=crop',
      featured: 0,
      status: 'active',
    },
    {
      id: 'prod_011',
      name: 'SaaS Landing Page Template',
      slug: 'saas-landing-page-template',
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
      short_description: 'Next.js + Tailwind landing page with: hero, features, pricing table, testimonials, FAQ, CTA sections. Stripe-ready. Dark and light themes.',
      price_cents: 2499,
      compare_price_cents: 4999,
      category: 'dev-templates',
      tags: '["saas","landing-page","nextjs","tailwind","template"]',
      thumbnail_url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop',
      featured: 0,
      status: 'active',
    },
    {
      id: 'prod_012',
      name: 'Midjourney Prompt Encyclopedia',
      slug: 'midjourney-prompt-encyclopedia',
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
      short_description: '500+ Midjourney prompts organized by style: photorealistic, anime, oil painting, 3D render, architectural. Includes aspect ratios, style modifiers, and negative prompts.',
      price_cents: 1999,
      compare_price_cents: 3499,
      category: 'prompt-packs',
      tags: '["midjourney","ai-art","prompts","design","creative"]',
      thumbnail_url: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&h=400&fit=crop',
      featured: 0,
      status: 'active',
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO products (id, name, slug, description, short_description, price_cents, compare_price_cents, category, tags, thumbnail_url, featured, status)
    VALUES (@id, @name, @slug, @description, @short_description, @price_cents, @compare_price_cents, @category, @tags, @thumbnail_url, @featured, @status)
  `);

  const insertAll = db.transaction(() => {
    for (const product of products) {
      stmt.run(product);
    }
  });

  insertAll();
}
