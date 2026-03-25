"use client";

import { useState } from "react";
import BuyButton from "@/components/BuyButton";
import PayPalButton from "@/components/PayPalButton";
import CryptoPayButton from "@/components/CryptoPayButton";
import CheckoutConsent from "@/components/CheckoutConsent";

interface PurchaseActionsProps {
  productId: string;
  priceCents: number;
  isDigitalProduct?: boolean;
}

export default function PurchaseActions({
  productId,
  priceCents,
  isDigitalProduct = true,
}: PurchaseActionsProps) {
  const [consentGiven, setConsentGiven] = useState(false);

  return (
    <div>
      <CheckoutConsent
        onConsentChange={setConsentGiven}
        isDigitalProduct={isDigitalProduct}
      />
      <div className="mt-4">
        <BuyButton
          productId={productId}
          priceCents={priceCents}
          className="mb-4"
          consentGiven={consentGiven}
        />
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
      </div>
    </div>
  );
}
