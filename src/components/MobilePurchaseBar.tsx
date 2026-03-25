"use client";

import { useState } from "react";
import {
  Loader2,
  X,
  Zap,
  Lock,
  ShieldCheck,
  Mail,
  FileText,
  HardDrive,
} from "lucide-react";
import CategoryIcon from "@/components/CategoryIcon";
import CheckoutConsent from "@/components/CheckoutConsent";
import PayPalButton from "@/components/PayPalButton";
import CryptoPayButton from "@/components/CryptoPayButton";
import { usePricing } from "@/hooks/usePricing";
import {
  convertCents,
  formatPriceWithCurrency,
  getDiscountedPrice,
} from "@/lib/pricing";

interface MobilePurchaseBarProps {
  productId: string;
  productName: string;
  /** Original price in USD cents */
  priceCents: number;
  comparePriceCents: number | null;
  savingsText: string | null;
  categoryLabel: string | null;
  categoryIconName: string | null;
  fileName: string | null;
  fileSizeFormatted: string | null;
}

export default function MobilePurchaseBar({
  productId,
  productName,
  priceCents,
  comparePriceCents,
  savingsText,
  categoryLabel,
  categoryIconName,
  fileName,
  fileSizeFormatted,
}: MobilePurchaseBarProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const { tier, currency, ready } = usePricing();

  const convertedCents = convertCents(priceCents, currency);
  const finalCents = getDiscountedPrice(convertedCents, tier);
  const price = ready
    ? formatPriceWithCurrency(finalCents, currency)
    : formatPriceWithCurrency(priceCents, "usd");

  const fullConvertedPrice = ready
    ? formatPriceWithCurrency(convertedCents, currency)
    : null;
  const hasPPPDiscount = tier > 1;

  const hasProductSale =
    comparePriceCents != null && comparePriceCents > priceCents;
  const convertedCompare =
    hasProductSale && comparePriceCents
      ? formatPriceWithCurrency(
          convertCents(comparePriceCents, currency),
          currency,
        )
      : null;

  async function handleBuy() {
    if (!consentGiven) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, currency, tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === "stripe_not_configured") {
        setError("Payments coming soon!");
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
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div
          className="border-t border-white/[0.08] px-4 py-3 flex items-center justify-between gap-3"
          style={{
            background: "rgba(10, 10, 15, 0.95)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex-1 min-w-0">
            <button
              onClick={() => setExpanded(true)}
              className="text-left focus-glow rounded-lg p-1 -m-1"
              aria-label="View purchase details"
            >
              <p className="text-white font-bold text-lg">{price}</p>
              {hasPPPDiscount && fullConvertedPrice && (
                <p className="text-xs text-zinc-600 line-through">
                  {fullConvertedPrice}
                </p>
              )}
              {!hasPPPDiscount && hasProductSale && (
                <p className="text-xs text-emerald-400">{savingsText}</p>
              )}
            </button>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="btn-gradient px-6 py-3 rounded-xl font-semibold text-base whitespace-nowrap flex items-center gap-2 focus-glow min-h-[44px]"
          >
            <span>Buy Now</span>
          </button>
        </div>
        {error && (
          <div className="bg-amber-500/10 border-t border-amber-500/20 px-4 py-2 text-center">
            <p className="text-amber-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex items-end"
          onClick={() => setExpanded(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full rounded-t-3xl p-6 pb-8 animate-slide-up"
            style={{
              background: "#0A0A0F",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors focus-glow min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-zinc-400" aria-hidden="true" />
            </button>

            {categoryLabel && categoryIconName && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mb-3"
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "#A5B4FC",
                }}
              >
                <CategoryIcon
                  name={categoryIconName}
                  className="w-3 h-3"
                  aria-hidden="true"
                />
                {categoryLabel}
              </span>
            )}

            <h3 className="text-lg font-bold text-white mb-4">{productName}</h3>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-white">{price}</span>
              {hasPPPDiscount && fullConvertedPrice && (
                <span className="text-lg text-zinc-600 line-through">
                  {fullConvertedPrice}
                </span>
              )}
              {!hasPPPDiscount && hasProductSale && convertedCompare && (
                <span className="text-lg text-zinc-600 line-through">
                  {convertedCompare}
                </span>
              )}
            </div>

            {savingsText && !hasPPPDiscount && hasProductSale && (
              <div
                className="text-sm font-medium px-4 py-2 rounded-lg mb-5 text-center"
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "#6EE7B7",
                }}
              >
                {savingsText}
              </div>
            )}

            <div className="mb-5">
              <CheckoutConsent
                onConsentChange={setConsentGiven}
                isDigitalProduct={true}
              />
            </div>

            <p className="text-xs text-zinc-600 text-center mb-3">
              Instant download.{" "}
              <a
                href="/sales-terms"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                Sales Terms
              </a>{" "}
              apply.
            </p>

            <button
              onClick={handleBuy}
              disabled={loading || !consentGiven}
              className={`w-full btn-gradient px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 focus-glow mb-4 min-h-[48px] ${
                !consentGiven
                  ? "opacity-50 cursor-not-allowed"
                  : "disabled:opacity-50"
              }`}
              title={
                !consentGiven
                  ? "Please agree to the terms above before purchasing"
                  : undefined
              }
            >
              {loading ? (
                <>
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    aria-hidden="true"
                  />
                  Processing...
                </>
              ) : (
                <>Buy Now &mdash; {price}</>
              )}
            </button>

            <PayPalButton
              productId={productId}
              className="mb-3"
              consentGiven={consentGiven}
            />

            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-zinc-700/50" />
              <span className="text-zinc-500 text-xs">or</span>
              <div className="flex-1 h-px bg-zinc-700/50" />
            </div>

            <CryptoPayButton
              productId={productId}
              priceCents={priceCents}
              className="mb-5"
              consentGiven={consentGiven}
            />

            <div className="grid grid-cols-2 gap-3 text-sm text-zinc-500 mb-4">
              <div className="flex items-center gap-2">
                <Zap
                  className="w-4 h-4 text-indigo-400 shrink-0"
                  aria-hidden="true"
                />
                <span>Instant download</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock
                  className="w-4 h-4 text-indigo-400 shrink-0"
                  aria-hidden="true"
                />
                <span>Lifetime access</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="w-4 h-4 text-indigo-400 shrink-0"
                  aria-hidden="true"
                />
                <span>30-day guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail
                  className="w-4 h-4 text-indigo-400 shrink-0"
                  aria-hidden="true"
                />
                <span>Email support</span>
              </div>
            </div>

            {(fileName || fileSizeFormatted) && (
              <div className="flex items-center gap-4 text-xs text-zinc-600 pt-3 border-t border-white/[0.06]">
                {fileName && (
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="truncate max-w-[120px]">{fileName}</span>
                  </div>
                )}
                {fileSizeFormatted && (
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{fileSizeFormatted}</span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="text-amber-400 text-sm mt-3 text-center">{error}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
