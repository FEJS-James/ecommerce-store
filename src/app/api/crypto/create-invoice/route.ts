import { NextRequest, NextResponse } from 'next/server';
import { queryOne, ensureDb } from '@/lib/db';
import { isBTCPayConfigured, createBTCPayInvoice } from '@/lib/btcpay';
import { v4 as uuidv4 } from 'uuid';
import type { Product } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { productId, customerEmail } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    if (!isBTCPayConfigured()) {
      return NextResponse.json({ error: 'btcpay_not_configured' }, { status: 503 });
    }

    await ensureDb();

    const product = await queryOne<Product>(
      "SELECT * FROM products WHERE id = ? AND status = 'active'",
      [productId]
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const orderId = uuidv4().replace(/-/g, '');

    const invoice = await createBTCPayInvoice({
      amount: Number(product.price_cents),
      productId: product.id,
      productName: product.name,
      customerEmail: customerEmail || '',
      orderId,
    });

    return NextResponse.json({
      invoiceId: invoice.id,
      checkoutLink: invoice.checkoutLink,
    });
  } catch (error) {
    console.error('BTCPay create invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to create BTCPay invoice' },
      { status: 500 }
    );
  }
}
