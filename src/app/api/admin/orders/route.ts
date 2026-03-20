import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const sessionId = request.nextUrl.searchParams.get('session_id');
    const startDate = request.nextUrl.searchParams.get('start_date');
    const endDate = request.nextUrl.searchParams.get('end_date');

    // Single order lookup by session_id (for thank-you page)
    if (sessionId) {
      const order = db.prepare(`
        SELECT o.*, p.name as product_name, p.slug as product_slug, p.category as product_category
        FROM orders o
        LEFT JOIN products p ON p.id = o.product_id
        WHERE o.stripe_session_id = ?
      `).get(sessionId);

      if (!order) {
        return NextResponse.json({ order: null });
      }

      // Get related products
      const typedOrder = order as { product_category?: string; product_id?: string };
      const relatedProducts = typedOrder.product_category
        ? db.prepare(
            "SELECT * FROM products WHERE category = ? AND id != ? AND status = 'active' LIMIT 4"
          ).all(typedOrder.product_category, typedOrder.product_id || '')
        : [];

      return NextResponse.json({ order, relatedProducts });
    }

    // List all orders with filters
    let query = `
      SELECT o.*, p.name as product_name
      FROM orders o
      LEFT JOIN products p ON p.id = o.product_id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (startDate) {
      query += ' AND date(o.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date(o.created_at) <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY o.created_at DESC';

    const orders = db.prepare(query).all(...params);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders error:', error);
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}
