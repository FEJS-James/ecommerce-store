"use client";

import { useState, useEffect } from "react";
import type { PricingTier, SupportedCurrency } from "@/lib/pricing";

interface PricingState {
  tier: PricingTier;
  currency: SupportedCurrency;
  discountPct: number;
  ready: boolean;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function usePricing(): PricingState {
  const [state, setState] = useState<PricingState>({
    tier: 1,
    currency: "usd",
    discountPct: 0,
    ready: false,
  });

  useEffect(() => {
    const tierRaw = getCookie("x-pricing-tier");
    const discountRaw = getCookie("x-discount-pct");

    const tierNum = parseInt(tierRaw || "1", 10);
    const tier: PricingTier = tierNum === 2 ? 2 : tierNum === 3 ? 3 : 1;

    // All display prices are USD regardless of geo location.
    const currency: SupportedCurrency = "usd";

    const discountPct = parseInt(discountRaw || "0", 10);

    setState({ tier, currency, discountPct, ready: true });
  }, []);

  return state;
}
