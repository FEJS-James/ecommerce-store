"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { usePricing } from "@/hooks/usePricing";
import {
  convertCents,
  formatPriceWithCurrency,
  getDiscountedPrice,
} from "@/lib/pricing";

interface BuyButtonProps {
  productId: string;
  /** Original price in USD cents */
  priceCents: number;
  className?: string;
  /** If true, force GBP and skip PPP discounts (for services) */
  forceGBP?: boolean;
}

export default function BuyButton({
  productId,
  priceCents,
  className = "",
  forceGBP = false,
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { tier, currency, ready } = usePricing();

  const effectiveCurrency = forceGBP ? "gbp" : currency;
  const effectiveTier = forceGBP ? 1 : tier;

  const convertedCents = convertCents(priceCents, effectiveCurrency);
  const finalCents = getDiscountedPrice(convertedCents, effectiveTier);
  const displayPrice = ready
    ? formatPriceWithCurrency(finalCents, effectiveCurrency)
    : formatPriceWithCurrency(priceCents, "usd");

  async function handleBuy() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          currency: effectiveCurrency,
          tier: effectiveTier,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === "stripe_not_configured") {
        setError("Payments coming soon! Check back shortly.");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full btn-gradient px-8 py-4 rounded-xl font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-2 focus-glow"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            Processing...
          </>
        ) : (
          <>Buy Now &mdash; {displayPrice}</>
        )}
      </button>
      {error && (
        <p className="text-amber-400 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
