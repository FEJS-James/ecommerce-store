"use client";

import { useState, useCallback } from "react";
import { Check } from "lucide-react";

interface CheckoutConsentProps {
  onConsentChange: (consented: boolean) => void;
  isDigitalProduct?: boolean;
}

function ConsentCheckbox({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
      <div className="relative shrink-0 mt-0.5">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className="w-5 h-5 rounded border transition-all duration-200 flex items-center justify-center"
          style={{
            background: checked
              ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
              : "rgba(255, 255, 255, 0.05)",
            borderColor: checked ? "transparent" : "rgba(255, 255, 255, 0.15)",
          }}
        >
          {checked && (
            <Check
              className="w-3.5 h-3.5 text-white"
              aria-hidden="true"
              strokeWidth={3}
            />
          )}
        </div>
      </div>
      <span className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors select-none">
        {children}
      </span>
    </label>
  );
}

export default function CheckoutConsent({
  onConsentChange,
  isDigitalProduct = true,
}: CheckoutConsentProps) {
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [digitalConsent, setDigitalConsent] = useState(false);

  const updateConsent = useCallback(
    (terms: boolean, digital: boolean) => {
      if (isDigitalProduct) {
        onConsentChange(terms && digital);
      } else {
        onConsentChange(terms);
      }
    },
    [isDigitalProduct, onConsentChange],
  );

  function handleTermsChange(checked: boolean) {
    setTermsAgreed(checked);
    updateConsent(checked, digitalConsent);
  }

  function handleDigitalChange(checked: boolean) {
    setDigitalConsent(checked);
    updateConsent(termsAgreed, checked);
  }

  return (
    <div className="space-y-3">
      <ConsentCheckbox
        id="checkout-terms"
        checked={termsAgreed}
        onChange={handleTermsChange}
      >
        I agree to the{" "}
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 transition-colors underline"
          onClick={(e) => e.stopPropagation()}
        >
          Terms &amp; Conditions
        </a>{" "}
        and{" "}
        <a
          href="/sales-terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 transition-colors underline"
          onClick={(e) => e.stopPropagation()}
        >
          Sales Terms
        </a>
      </ConsentCheckbox>

      {isDigitalProduct && (
        <ConsentCheckbox
          id="checkout-digital"
          checked={digitalConsent}
          onChange={handleDigitalChange}
        >
          I consent to immediate access to the digital content and acknowledge
          that I lose my right to cancel once the download begins
        </ConsentCheckbox>
      )}
    </div>
  );
}
