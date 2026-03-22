import { NextResponse } from 'next/server';
import { getAuthenticatedCustomer } from '@/lib/customer-auth';
import { queryAll, ensureDb } from '@/lib/db';

interface OrderWithProduct {
  id: string;
  customer_email: string;
  customer_name: string | null;
  product_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  download_token: string | null;
  download_count: number;
  max_downloads: number;
  token_expires_at: string | null;
  created_at: string;
  product_name: string | null;
  product_slug: string | null;
  product_thumbnail_url: string | null;
}

export async function GET() {
  try {
    await ensureDb();
    const payload = await getAuthenticatedCustomer();
    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const orders = await queryAll<OrderWithProduct>(
      `SELECT o.id, o.customer_email, o.customer_name, o.product_id, o.amount_cents,
              o.currency, o.status, o.download_token, o.download_count, o.max_downloads,
              o.token_expires_at, o.created_at,
              p.name as product_name, p.slug as product_slug, p.thumbnail_url as product_thumbnail_url
       FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       WHERE o.customer_id = ? OR o.customer_email = ?
       ORDER BY o.created_at DESC`,
      [payload.sub, payload.email]
    );

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
