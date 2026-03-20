import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    const order = await queryOne(`
      SELECT o.*, p.name as product_name, p.slug as product_slug, p.category as product_category
      FROM orders o
      LEFT JOIN products p ON p.id = o.product_id
      WHERE o.stripe_session_id = ?
    `, [sessionId]);

    if (!order) {
      return NextResponse.json({ order: null });
    }

    // Get related products
    const typedOrder = order as { product_category?: string; product_id?: string };
    const relatedProducts = typedOrder.product_category
      ? await queryAll(
          "SELECT * FROM products WHERE category = ? AND id != ? AND status = 'active' LIMIT 4",
          [typedOrder.product_category, typedOrder.product_id || '']
        )
      : [];

    return NextResponse.json({ order, relatedProducts });
  } catch (error) {
    console.error('Order lookup error:', error);
    return NextResponse.json({ error: 'Failed to look up order' }, { status: 500 });
  }
}
