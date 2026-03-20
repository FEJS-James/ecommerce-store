import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import type { Product } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const db = getDb();
    const product = db.prepare("SELECT * FROM products WHERE id = ? AND status = 'active'").get(productId) as Product | undefined;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
    }

    const stripe = getStripe()!;
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.short_description || undefined,
              images: product.thumbnail_url ? [product.thumbnail_url] : undefined,
            },
            unit_amount: product.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/products/${product.slug}`,
      metadata: {
        product_id: product.id,
        product_slug: product.slug,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
