import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (stripeInstance) return stripeInstance;
  stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
  });
  return stripeInstance;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
