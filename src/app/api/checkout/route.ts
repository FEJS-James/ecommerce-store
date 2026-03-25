import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import {
  parsePricingContext,
  convertCents,
  getStripeCouponForTier,
} from "@/lib/pricing";
import type { Product } from "@/lib/types";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, currency: reqCurrency, tier: reqTier } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 },
      );
    }

    const product = await queryOne<Product>(
      "SELECT * FROM products WHERE id = ? AND status = 'active'",
      [productId],
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "stripe_not_configured" },
        { status: 503 },
      );
    }

    const stripe = getStripe()!;
    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Parse pricing context from request body (set by BuyButton from cookies)
    const { tier, currency } = parsePricingContext({
      tier: reqTier != null ? String(reqTier) : "1",
      currency: reqCurrency || "usd",
    });

    // Convert price to target currency (full price before any PPP discount)
    // Coerce to number — SQLite may return strings for INTEGER columns
    const priceCents = Number(product.price_cents);
    const convertedCents = convertCents(priceCents, currency);

    // Build line items with the correct currency at full price
    // PPP discount is applied via Stripe coupon
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: currency,
          product_data: {
            name: product.name,
            description: product.short_description || undefined,
            images: product.thumbnail_url ? [product.thumbnail_url] : undefined,
          },
          unit_amount: convertedCents,
        },
        quantity: 1,
      },
    ];

    // Build session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/products/${product.slug}`,
      metadata: {
        product_id: product.id,
        product_slug: product.slug,
        pricing_tier: String(tier),
        original_price_usd_cents: String(priceCents),
        charged_currency: currency,
        discount_pct: tier === 2 ? "30" : tier === 3 ? "50" : "0",
      },
    };

    // Apply Stripe coupon for PPP tiers (PPP_30 or PPP_50)
    // These coupons must exist in the Stripe dashboard
    const couponCode = getStripeCouponForTier(tier);
    if (couponCode) {
      sessionParams.discounts = [{ coupon: couponCode }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
