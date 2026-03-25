"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { usePricing } from "@/hooks/usePricing";
import {
  convertCents,
  formatPriceWithCurrency,
  getDiscountedPrice,
} from "@/lib/pricing";

interface CryptoPayButtonProps {
  productId: string;
  /** Original price in USD cents */
  priceCents: number;
  className?: string;
  /** If false, the button is disabled and shows a consent reminder */
  consentGiven?: boolean;
}

function BitcoinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M14.24 10.56c-.31 1.24-2.24.73-2.88.58l.55-2.18c.64.16 2.67.47 2.33 1.6zm-1.31 2.03c-.36 1.46-2.76.89-3.54.7l.63-2.49c.78.2 3.31.58 2.91 1.79zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.41 11.17c-.46 1.4-1.67 1.86-2.77 1.72l-.46 1.82-1.1-.28.45-1.78c-.29-.07-.58-.15-.88-.24l-.45 1.79-1.1-.28.46-1.83c-.24-.06-.48-.13-.72-.2l-1.51-.38.55-1.17s.81.21.8.2c.44.11.52-.18.54-.29l.72-2.84.18.05c-.03-.01-.06-.02-.09-.03l.51-2.03c.02-.21-.05-.5-.54-.62.02-.01-.8-.2-.8-.2l.3-1.17 1.6.4-.01.02c.22.06.45.11.69.17l.45-1.81 1.1.28-.45 1.76c.3.07.61.14.9.22l.45-1.78 1.1.28-.46 1.82c1.73.52 3.02 1.14 2.67 2.76-.28 1.3-.93 1.65-1.86 1.72.7.35 1.15.93.86 2.03z" />
    </svg>
  );
}

export default function CryptoPayButton({
  productId,
  priceCents,
  className = "",
  consentGiven = true,
}: CryptoPayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { tier, currency, ready } = usePricing();

  const convertedCents = convertCents(priceCents, currency);
  const finalCents = getDiscountedPrice(convertedCents, tier);
  const displayPrice = ready
    ? formatPriceWithCurrency(finalCents, currency)
    : formatPriceWithCurrency(priceCents, "usd");

  async function handleCryptoPay() {
    if (!consentGiven) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/crypto/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, customerEmail: "" }),
      });

      if (res.status === 503) {
        setError("Crypto payments coming soon");
        return;
      }

      const data = await res.json();

      if (data.checkoutLink) {
        window.location.href = data.checkoutLink;
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
        onClick={handleCryptoPay}
        disabled={loading || !consentGiven}
        data-umami-event="crypto_pay_click"
        className={`w-full px-6 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-amber-600/20 border border-amber-500/30 text-amber-300 hover:bg-amber-600/30 transition-colors ${
          !consentGiven
            ? "opacity-50 cursor-not-allowed"
            : "disabled:opacity-50"
        }`}
        title={
          !consentGiven
            ? "Please agree to the terms and conditions below before purchasing"
            : undefined
        }
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Processing...
          </>
        ) : (
          <>
            <BitcoinIcon />
            Pay with Bitcoin &mdash; {displayPrice}
          </>
        )}
      </button>
      {error && (
        <p className="text-amber-400 text-xs mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
