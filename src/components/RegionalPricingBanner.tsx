"use client";

import { useState, useEffect } from "react";
import { Globe, X } from "lucide-react";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function RegionalPricingBanner() {
  const [visible, setVisible] = useState(false);
  const [discountPct, setDiscountPct] = useState(0);

  useEffect(() => {
    const tier = getCookie("x-pricing-tier");
    const discount = getCookie("x-discount-pct");
    const dismissed = sessionStorage.getItem("ppp-banner-dismissed");

    if (dismissed === "true") return;

    const tierNum = parseInt(tier || "1", 10);
    const pct = parseInt(discount || "0", 10);

    if ((tierNum === 2 || tierNum === 3) && pct > 0) {
      setDiscountPct(pct);
      setVisible(true);
    }
  }, []);

  function handleDismiss() {
    setVisible(false);
    sessionStorage.setItem("ppp-banner-dismissed", "true");
  }

  if (!visible) return null;

  return (
    <div className="glass rounded-2xl px-4 py-3 mx-4 mt-4 sm:mx-6 lg:mx-8 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Globe
          className="w-5 h-5 text-indigo-400 shrink-0"
          aria-hidden="true"
        />
        <p className="text-sm text-zinc-300">
          You&apos;re getting regional pricing!{" "}
          <span className="font-semibold text-emerald-400">
            {discountPct}% off
          </span>{" "}
          in your country.
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors focus-glow"
        aria-label="Dismiss regional pricing banner"
      >
        <X className="w-4 h-4 text-zinc-400" aria-hidden="true" />
      </button>
    </div>
  );
}
