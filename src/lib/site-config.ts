/**
 * Central site configuration.
 * Uses NEXT_PUBLIC_SITE_URL env var when available (for preview deploys),
 * falls back to the production domain.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aiarmory.shop";

export const SITE_NAME = "AI Armory";

export const SITE_DESCRIPTION =
  "Premium AI-powered digital products, templates, prompt packs, and guides. Instant delivery, lifetime access.";
