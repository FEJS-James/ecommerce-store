export type PricingTier = 1 | 2 | 3;
export type SupportedCurrency = "usd" | "gbp" | "eur";

interface TierInfo {
  tier: PricingTier;
  currency: SupportedCurrency;
  discountPct: number;
  couponCode: string | null;
}

// Tier 1 — Full Price
const TIER_1_USD_COUNTRIES = ["US", "CA", "AU", "NZ", "SG", "HK"];
const TIER_1_GBP_COUNTRIES = ["GB", "IE"];
const TIER_1_EUR_COUNTRIES = ["NL", "SE", "NO", "DK", "FI", "DE", "CH", "AT"];
const TIER_1_USD_OTHER = ["AE", "IL", "JP", "KR"];

// Tier 2 — 30% Discount (USD)
const TIER_2_COUNTRIES = [
  "IN",
  "PH",
  "ZA",
  "KE",
  "NG",
  "GH",
  "PK",
  "BD",
  "LK",
  "MY",
  "PL",
  "RO",
  "CZ",
  "HU",
  "HR",
  "BG",
];

// Tier 3 — 50% Discount (USD)
const TIER_3_COUNTRIES = ["UG", "TZ", "ZW", "ZM", "RW", "ET", "NP", "MM", "KH"];

const COUNTRY_TIER_MAP = new Map<string, TierInfo>();

for (const code of TIER_1_USD_COUNTRIES) {
  COUNTRY_TIER_MAP.set(code, {
    tier: 1,
    currency: "usd",
    discountPct: 0,
    couponCode: null,
  });
}
for (const code of TIER_1_USD_OTHER) {
  COUNTRY_TIER_MAP.set(code, {
    tier: 1,
    currency: "usd",
    discountPct: 0,
    couponCode: null,
  });
}
for (const code of TIER_1_GBP_COUNTRIES) {
  COUNTRY_TIER_MAP.set(code, {
    tier: 1,
    currency: "gbp",
    discountPct: 0,
    couponCode: null,
  });
}
for (const code of TIER_1_EUR_COUNTRIES) {
  COUNTRY_TIER_MAP.set(code, {
    tier: 1,
    currency: "eur",
    discountPct: 0,
    couponCode: null,
  });
}
for (const code of TIER_2_COUNTRIES) {
  COUNTRY_TIER_MAP.set(code, {
    tier: 2,
    currency: "usd",
    discountPct: 30,
    couponCode: "PPP_30",
  });
}
for (const code of TIER_3_COUNTRIES) {
  COUNTRY_TIER_MAP.set(code, {
    tier: 3,
    currency: "usd",
    discountPct: 50,
    couponCode: "PPP_50",
  });
}

// Default: Tier 1 USD
const DEFAULT_TIER_INFO: TierInfo = {
  tier: 1,
  currency: "usd",
  discountPct: 0,
  couponCode: null,
};

/**
 * Get pricing tier info for a country code.
 * Returns Tier 1 USD for unknown or missing country codes.
 */
export function getTierForCountry(
  countryCode: string | null | undefined,
): TierInfo {
  if (!countryCode) return DEFAULT_TIER_INFO;
  return COUNTRY_TIER_MAP.get(countryCode.toUpperCase()) ?? DEFAULT_TIER_INFO;
}

// Hardcoded approximate conversion rates: 1 USD = X currency
const CURRENCY_RATES: Record<SupportedCurrency, number> = {
  usd: 1,
  gbp: 0.79,
  eur: 0.92,
};

const CURRENCY_CONFIG: Record<
  SupportedCurrency,
  { locale: string; code: string }
> = {
  usd: { locale: "en-US", code: "USD" },
  gbp: { locale: "en-GB", code: "GBP" },
  eur: { locale: "de-DE", code: "EUR" },
};

/**
 * Convert a price in USD cents to the target currency cents.
 */
export function convertCents(
  usdCents: number,
  currency: SupportedCurrency,
): number {
  const rate = CURRENCY_RATES[currency];
  return Math.round(usdCents * rate);
}

/**
 * Format a price given cents in the specified currency.
 */
export function formatPriceWithCurrency(
  cents: number,
  currency: SupportedCurrency,
): string {
  const config = CURRENCY_CONFIG[currency];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
  }).format(cents / 100);
}

/**
 * Get the discounted price in cents (already in the target currency).
 * For Tier 2: 30% off. For Tier 3: 50% off. Tier 1: no discount.
 */
export function getDiscountedPrice(cents: number, tier: PricingTier): number {
  switch (tier) {
    case 2:
      return Math.round(cents * 0.7);
    case 3:
      return Math.round(cents * 0.5);
    default:
      return cents;
  }
}

/**
 * Get the Stripe coupon code for a given tier, or null for Tier 1.
 */
export function getStripeCouponForTier(tier: PricingTier): string | null {
  switch (tier) {
    case 2:
      return "PPP_30";
    case 3:
      return "PPP_50";
    default:
      return null;
  }
}

/**
 * Parse pricing context from cookie/header values.
 */
export function parsePricingContext(values: {
  tier?: string | null;
  currency?: string | null;
  discountPct?: string | null;
}): { tier: PricingTier; currency: SupportedCurrency; discountPct: number } {
  const tierNum = parseInt(values.tier || "1", 10);
  const tier: PricingTier = tierNum === 2 ? 2 : tierNum === 3 ? 3 : 1;

  const rawCurrency = (values.currency || "usd").toLowerCase();
  const currency: SupportedCurrency =
    rawCurrency === "gbp" ? "gbp" : rawCurrency === "eur" ? "eur" : "usd";

  const discountPct = parseInt(values.discountPct || "0", 10);

  return { tier, currency, discountPct };
}
