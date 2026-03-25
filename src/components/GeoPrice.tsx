"use client";

import { usePricing } from "@/hooks/usePricing";
import {
  convertCents,
  formatPriceWithCurrency,
  getDiscountedPrice,
} from "@/lib/pricing";

interface GeoPriceProps {
  /** Original price in USD cents */
  priceCents: number;
  /** Original compare price in USD cents */
  comparePriceCents?: number | null;
  /** CSS class for the main price */
  className?: string;
  /** CSS class for the strikethrough original price */
  strikethroughClassName?: string;
  /** Whether to show the original (pre-discount) price with strikethrough for PPP tiers */
  showOriginal?: boolean;
}

/**
 * Display a product price in the visitor's detected currency,
 * with PPP discount applied for Tier 2/3 visitors.
 *
 * Falls back to USD with no discount while hydrating.
 */
export default function GeoPrice({
  priceCents,
  comparePriceCents,
  className = "text-lg font-bold text-white",
  strikethroughClassName = "text-sm text-zinc-600 line-through",
  showOriginal = true,
}: GeoPriceProps) {
  const { tier, currency, ready } = usePricing();

  // Convert base price to visitor currency
  const convertedCents = convertCents(priceCents, currency);
  // Apply PPP discount
  const finalCents = getDiscountedPrice(convertedCents, tier);
  const formattedPrice = formatPriceWithCurrency(finalCents, currency);

  // For strikethrough: show the full (non-discounted) converted price when PPP is active,
  // or show the compare_price if there's a standard sale price
  const hasProductSale = comparePriceCents && comparePriceCents > priceCents;
  const hasPPPDiscount = tier > 1;

  // SSR / pre-hydration: show a simple USD fallback to avoid layout shift
  if (!ready) {
    const fallbackFormatted = formatPriceWithCurrency(priceCents, "usd");
    return (
      <span className="inline-flex items-baseline gap-2">
        <span className={className}>{fallbackFormatted}</span>
        {hasProductSale && (
          <span className={strikethroughClassName}>
            {formatPriceWithCurrency(comparePriceCents, "usd")}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-baseline gap-2 flex-wrap">
      <span className={className}>{formattedPrice}</span>
      {showOriginal && hasPPPDiscount && (
        <span className={strikethroughClassName}>
          {formatPriceWithCurrency(convertedCents, currency)}
        </span>
      )}
      {!hasPPPDiscount && hasProductSale && (
        <span className={strikethroughClassName}>
          {formatPriceWithCurrency(
            convertCents(comparePriceCents, currency),
            currency,
          )}
        </span>
      )}
    </span>
  );
}
