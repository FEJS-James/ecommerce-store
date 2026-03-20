import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    // Revenue stats
    const todayRevenue = db.prepare(`
      SELECT COALESCE(SUM(amount_cents), 0) as total
      FROM orders WHERE status = 'completed' AND date(created_at) = date('now')
    `).get() as { total: number };

    const weekRevenue = db.prepare(`
      SELECT COALESCE(SUM(amount_cents), 0) as total
      FROM orders WHERE status = 'completed' AND created_at >= datetime('now', '-7 days')
    `).get() as { total: number };

    const monthRevenue = db.prepare(`
      SELECT COALESCE(SUM(amount_cents), 0) as total
      FROM orders WHERE status = 'completed' AND created_at >= datetime('now', '-30 days')
    `).get() as { total: number };

    const allTimeRevenue = db.prepare(`
      SELECT COALESCE(SUM(amount_cents), 0) as total
      FROM orders WHERE status = 'completed'
    `).get() as { total: number };

    // Daily revenue last 30 days
    const dailyRevenue = db.prepare(`
      SELECT date(created_at) as date, COALESCE(SUM(amount_cents), 0) as revenue
      FROM orders WHERE status = 'completed' AND created_at >= datetime('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY date ASC
    `).all() as Array<{ date: string; revenue: number }>;

    // Top 5 products by revenue
    const topProducts = db.prepare(`
      SELECT p.name, COALESCE(SUM(o.amount_cents), 0) as revenue, COUNT(o.id) as sales
      FROM products p
      LEFT JOIN orders o ON o.product_id = p.id AND o.status = 'completed'
      GROUP BY p.id
      ORDER BY revenue DESC
      LIMIT 5
    `).all() as Array<{ name: string; revenue: number; sales: number }>;

    // Recent orders
    const recentOrders = db.prepare(`
      SELECT o.*, p.name as product_name
      FROM orders o
      LEFT JOIN products p ON p.id = o.product_id
      ORDER BY o.created_at DESC
      LIMIT 10
    `).all();

    // Totals
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
    const totalSubscribers = db.prepare('SELECT COUNT(*) as count FROM email_subscribers WHERE unsubscribed_at IS NULL').get() as { count: number };

    return NextResponse.json({
      revenue: {
        today: todayRevenue.total,
        thisWeek: weekRevenue.total,
        thisMonth: monthRevenue.total,
        allTime: allTimeRevenue.total,
      },
      dailyRevenue,
      topProducts,
      recentOrders,
      totalCustomers: totalCustomers.count,
      totalSubscribers: totalSubscribers.count,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
