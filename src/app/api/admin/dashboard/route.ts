import { NextResponse } from 'next/server';
import { queryOne, queryAll } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const todayRevenue = await queryOne<{ total: number }>(`
      SELECT COALESCE(SUM(amount_cents), 0) as total
      FROM orders WHERE status = 'completed' AND date(created_at) = date('now')
    `);

    const weekRevenue = await queryOne<{ total: number }>(`
      SELECT COALESCE(SUM(amount_cents), 0) as total
      FROM orders WHERE status = 'completed' AND created_at >= datetime('now', '-7 days')
    `);

    const monthRevenue = await queryOne<{ total: number }>(`
      SELECT COALESCE(SUM(amount_cents), 0) as total
      FROM orders WHERE status = 'completed' AND created_at >= datetime('now', '-30 days')
    `);

    const allTimeRevenue = await queryOne<{ total: number }>(`
      SELECT COALESCE(SUM(amount_cents), 0) as total
      FROM orders WHERE status = 'completed'
    `);

    const dailyRevenue = await queryAll<{ date: string; revenue: number }>(`
      SELECT date(created_at) as date, COALESCE(SUM(amount_cents), 0) as revenue
      FROM orders WHERE status = 'completed' AND created_at >= datetime('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY date ASC
    `);

    const topProducts = await queryAll<{ name: string; revenue: number; sales: number }>(`
      SELECT p.name, COALESCE(SUM(o.amount_cents), 0) as revenue, COUNT(o.id) as sales
      FROM products p
      LEFT JOIN orders o ON o.product_id = p.id AND o.status = 'completed'
      GROUP BY p.id
      ORDER BY revenue DESC
      LIMIT 5
    `);

    const recentOrders = await queryAll(`
      SELECT o.*, p.name as product_name
      FROM orders o
      LEFT JOIN products p ON p.id = o.product_id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    const totalCustomers = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM customers');
    const totalSubscribers = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM email_subscribers WHERE unsubscribed_at IS NULL');

    return NextResponse.json({
      revenue: {
        today: todayRevenue?.total ?? 0,
        thisWeek: weekRevenue?.total ?? 0,
        thisMonth: monthRevenue?.total ?? 0,
        allTime: allTimeRevenue?.total ?? 0,
      },
      dailyRevenue,
      topProducts,
      recentOrders,
      totalCustomers: totalCustomers?.count ?? 0,
      totalSubscribers: totalSubscribers?.count ?? 0,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
