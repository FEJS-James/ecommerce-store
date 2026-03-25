import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { createPayPalOrder, isPayPalConfigured } from '@/lib/paypal';
import type { Product } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    if (!isPayPalConfigured()) {
      return NextResponse.json({ error: 'paypal_not_configured' }, { status: 503 });
    }

    const product = await queryOne<Product>(
      "SELECT * FROM products WHERE id = ? AND status = 'active'",
      [productId]
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const order = await createPayPalOrder(
      product.name,
      product.price_cents,
      product.id
    );

    return NextResponse.json({ orderID: order.id });
  } catch (error) {
    console.error('PayPal create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
// Force redeploy Wed Mar 25 05:36:35 CET 2026
