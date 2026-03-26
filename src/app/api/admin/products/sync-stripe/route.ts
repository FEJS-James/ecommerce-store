import { NextResponse } from 'next/server';
import { queryAll, execute, ensureDb } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { createStripeProduct } from '@/lib/stripe-sync';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Allow long-running sync (up to 60s for many products)
export const maxDuration = 60;

interface ProductRecord {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  status: string;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
}

/**
 * POST /api/admin/products/sync-stripe
 *
 * Bulk-syncs all active products to Stripe:
 * - Products missing stripe_product_id/stripe_price_id: creates them in Stripe
 * - Products with existing IDs: verifies they exist in Stripe, re-creates if archived/deleted
 * - Clears stale IDs that point to non-existent Stripe products
 *
 * Reusable — safe to run multiple times. Idempotent for products already synced.
 */
export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify Stripe is configured
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: 'STRIPE_SECRET_KEY not configured' },
      { status: 503 }
    );
  }

  const stripe = new Stripe(stripeKey);

  await ensureDb();

  // Fetch all active products (archived/draft don't need Stripe products)
  const products = await queryAll<ProductRecord>(
    `SELECT id, name, description, price_cents, status, stripe_product_id, stripe_price_id
     FROM products WHERE status = 'active'`
  );

  const results: {
    synced: string[];
    verified: string[];
    recreated: string[];
    failed: { id: string; name: string; error: string }[];
    skipped: string[];
  } = {
    synced: [],
    verified: [],
    recreated: [],
    failed: [],
    skipped: [],
  };

  for (const product of products) {
    try {
      if (product.stripe_product_id && product.stripe_price_id) {
        // Product has existing Stripe IDs — verify they're valid
        const verification = await verifyStripeProduct(
          stripe,
          product.stripe_product_id,
          product.stripe_price_id
        );

        if (verification.valid) {
          // IDs are valid and product is active
          results.verified.push(product.name);
          continue;
        }

        if (verification.needsReactivation) {
          // Product exists but is archived — reactivate it
          try {
            await stripe.products.update(product.stripe_product_id, { active: true });

            // Also verify/fix the price
            if (!verification.priceValid) {
              const newPriceId = await createNewPrice(stripe, product);
              if (newPriceId) {
                await execute(
                  `UPDATE products SET stripe_price_id = ? WHERE id = ?`,
                  [newPriceId, product.id]
                );
              }
            }

            results.recreated.push(product.name);
            continue;
          } catch (reactivateErr) {
            console.error(
              `[sync-stripe] Failed to reactivate ${product.stripe_product_id}:`,
              reactivateErr
            );
            // Fall through to create fresh
          }
        }

        // Existing IDs are stale/deleted — clear them and create fresh
        console.log(
          `[sync-stripe] Stale Stripe IDs for "${product.name}" (${product.id}), creating fresh`
        );
        await execute(
          `UPDATE products SET stripe_product_id = NULL, stripe_price_id = NULL WHERE id = ?`,
          [product.id]
        );
      }

      // No valid Stripe IDs — create product + price in Stripe
      const stripeResult = await createStripeProduct({
        name: product.name,
        description: product.description || undefined,
        price_cents: product.price_cents,
      });

      if (stripeResult) {
        await execute(
          `UPDATE products SET stripe_product_id = ?, stripe_price_id = ? WHERE id = ?`,
          [stripeResult.stripe_product_id, stripeResult.stripe_price_id, product.id]
        );
        results.synced.push(product.name);
      } else {
        results.failed.push({
          id: product.id,
          name: product.name,
          error: 'createStripeProduct returned null',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[sync-stripe] Error syncing "${product.name}":`, err);
      results.failed.push({
        id: product.id,
        name: product.name,
        error: errorMessage,
      });
    }
  }

  const summary = {
    total: products.length,
    synced: results.synced.length,
    verified: results.verified.length,
    recreated: results.recreated.length,
    failed: results.failed.length,
    details: results,
  };

  console.log('[sync-stripe] Bulk sync complete:', JSON.stringify(summary, null, 2));

  return NextResponse.json(summary);
}

/**
 * Verify a Stripe product + price exist and are active.
 */
async function verifyStripeProduct(
  stripe: Stripe,
  productId: string,
  priceId: string
): Promise<{
  valid: boolean;
  needsReactivation: boolean;
  priceValid: boolean;
}> {
  try {
    const stripeProduct = await stripe.products.retrieve(productId);

    let priceValid = false;
    try {
      const stripePrice = await stripe.prices.retrieve(priceId);
      priceValid = stripePrice.active;
    } catch {
      // Price doesn't exist
    }

    if (stripeProduct.active && priceValid) {
      return { valid: true, needsReactivation: false, priceValid: true };
    }

    if (!stripeProduct.active) {
      return { valid: false, needsReactivation: true, priceValid };
    }

    // Product active but price invalid
    return { valid: false, needsReactivation: false, priceValid: false };
  } catch (err) {
    // Product doesn't exist in Stripe (deleted or wrong account)
    if (err instanceof Stripe.errors.StripeError && err.statusCode === 404) {
      return { valid: false, needsReactivation: false, priceValid: false };
    }
    throw err; // Re-throw unexpected errors
  }
}

/**
 * Create a new Stripe price for an existing product.
 */
async function createNewPrice(
  stripe: Stripe,
  product: ProductRecord
): Promise<string | null> {
  try {
    const price = await stripe.prices.create({
      product: product.stripe_product_id!,
      unit_amount: product.price_cents,
      currency: 'usd',
    });
    return price.id;
  } catch (err) {
    console.error(`[sync-stripe] Failed to create price for ${product.id}:`, err);
    return null;
  }
}
