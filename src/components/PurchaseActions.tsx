"use client";

import { useState } from "react";
import BuyButton from "@/components/BuyButton";
import PayPalButton from "@/components/PayPalButton";
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
      <BuyButton
        productId={productId}
        priceCents={priceCents}
        className="mb-4"
        consentGiven={consentGiven}
      />
      <PayPalButton
        productId={productId}
        className="mb-5"
        consentGiven={consentGiven}
      />
      <CheckoutConsent
        onConsentChange={setConsentGiven}
        isDigitalProduct={isDigitalProduct}
      />
    </div>
  );
}
