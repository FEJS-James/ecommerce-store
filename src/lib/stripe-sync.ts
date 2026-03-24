import Stripe from 'stripe';

let _stripe: Stripe | null | undefined;

function getStripe(): Stripe | null {
  if (_stripe !== undefined) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn('[stripe-sync] STRIPE_SECRET_KEY not set — skipping Stripe sync');
    _stripe = null;
    return null;
  }
  _stripe = new Stripe(key);
  return _stripe;
}

/**
 * Create a Stripe product + price for a new product.
 * Returns the stripe_product_id and stripe_price_id, or null if Stripe is unavailable.
 */
export async function createStripeProduct(product: {
  name: string;
  description?: string;
  price_cents: number;
}): Promise<{ stripe_product_id: string; stripe_price_id: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  try {
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description || undefined,
    });

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: product.price_cents,
      currency: 'usd',
    });

    console.log(`[stripe-sync] Created product ${stripeProduct.id} with price ${stripePrice.id}`);
    return {
      stripe_product_id: stripeProduct.id,
      stripe_price_id: stripePrice.id,
    };
  } catch (error) {
    console.error('[stripe-sync] Failed to create Stripe product:', error);
    return null;
  }
}

/**
 * Update a Stripe product's name and/or description.
 */
export async function updateStripeProduct(
  stripe_product_id: string,
  updates: { name?: string; description?: string }
): Promise<void> {
  const stripe = getStripe();
  if (!stripe) return;

  try {
    const payload: Stripe.ProductUpdateParams = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;

    if (Object.keys(payload).length > 0) {
      await stripe.products.update(stripe_product_id, payload);
      console.log(`[stripe-sync] Updated product ${stripe_product_id}`);
    }
  } catch (error) {
    console.error(`[stripe-sync] Failed to update Stripe product ${stripe_product_id}:`, error);
  }
}

/**
 * Create a new Stripe Price and archive the old one (prices are immutable in Stripe).
 * Returns the new stripe_price_id, or null if Stripe is unavailable.
 */
export async function updateStripePrice(
  stripe_product_id: string,
  old_stripe_price_id: string | null,
  new_price_cents: number
): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  try {
    // Create new price
    const newPrice = await stripe.prices.create({
      product: stripe_product_id,
      unit_amount: new_price_cents,
      currency: 'usd',
    });

    // Archive the old price if it exists
    if (old_stripe_price_id) {
      await stripe.prices.update(old_stripe_price_id, { active: false });
      console.log(`[stripe-sync] Archived old price ${old_stripe_price_id}`);
    }

    console.log(`[stripe-sync] Created new price ${newPrice.id} for product ${stripe_product_id}`);
    return newPrice.id;
  } catch (error) {
    console.error(`[stripe-sync] Failed to update Stripe price for ${stripe_product_id}:`, error);
    return null;
  }
}

/**
 * Archive (deactivate) a Stripe product. Sets active=false.
 */
export async function archiveStripeProduct(stripe_product_id: string): Promise<void> {
  const stripe = getStripe();
  if (!stripe) return;

  try {
    await stripe.products.update(stripe_product_id, { active: false });
    console.log(`[stripe-sync] Archived product ${stripe_product_id}`);
  } catch (error) {
    console.error(`[stripe-sync] Failed to archive Stripe product ${stripe_product_id}:`, error);
  }
}

/**
 * Reactivate a previously archived Stripe product. Sets active=true.
 */
export async function reactivateStripeProduct(stripe_product_id: string): Promise<void> {
  const stripe = getStripe();
  if (!stripe) return;

  try {
    await stripe.products.update(stripe_product_id, { active: true });
    console.log(`[stripe-sync] Reactivated product ${stripe_product_id}`);
  } catch (error) {
    console.error(`[stripe-sync] Failed to reactivate Stripe product ${stripe_product_id}:`, error);
  }
}
