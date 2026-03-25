export type PricingTier = 1 | 2 | 3;
// All prices are displayed in USD. Legacy type kept for compatibility.
export type SupportedCurrency = "usd";

interface TierInfo {
  tier: PricingTier;
  currency: SupportedCurrency;
  discountPct: number;
  couponCode: string | null;
}

// Tier 1 -- Full Price (all major economies)
const TIER_1_COUNTRIES = [
  "US",
  "CA",
  "AU",
  "NZ",
  "SG",
  "HK",
  "GB",
  "IE",
  "NL",
  "SE",
  "NO",
  "DK",
  "FI",
  "DE",
  "CH",
  "AT",
  "AE",
  "IL",
  "JP",
  "KR",
];

// Tier 2 -- 30% PPP Discount (USD)
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

// Tier 3 -- 50% PPP Discount (USD)
const TIER_3_COUNTRIES = ["UG", "TZ", "ZW", "ZM", "RW", "ET", "NP", "MM", "KH"];

const COUNTRY_TIER_MAP = new Map<string, TierInfo>();

for (const code of TIER_1_COUNTRIES) {
  COUNTRY_TIER_MAP.set(code, {
    tier: 1,
    currency: "usd",
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

// All prices are USD -- no multi-currency conversion needed.
const CURRENCY_RATES: Record<SupportedCurrency, number> = {
  usd: 1,
};

const CURRENCY_CONFIG: Record<
  SupportedCurrency,
  { locale: string; code: string }
> = {
  usd: { locale: "en-US", code: "USD" },
};

/**
 * Convert a price in USD cents to the target currency cents.
 */
export function convertCents(
  usdCents: number,
  currency: SupportedCurrency,
): number {
  const rate = CURRENCY_RATES[currency];
  return Math.round(Number(usdCents) * rate);
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
  }).format(Number(cents) / 100);
}

/**
 * Get the discounted price in cents (already in the target currency).
 * For Tier 2: 30% off. For Tier 3: 50% off. Tier 1: no discount.
 */
export function getDiscountedPrice(cents: number, tier: PricingTier): number {
  const safeCents = Number(cents);
  switch (tier) {
    case 2:
      return Math.round(safeCents * 0.7);
    case 3:
      return Math.round(safeCents * 0.5);
    default:
      return safeCents;
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

  // All display prices are USD regardless of geo cookie value.
  const currency: SupportedCurrency = "usd";

  const discountPct = parseInt(values.discountPct || "0", 10);

  return { tier, currency, discountPct };
}
