import AdminGuard from '@/components/AdminGuard';
import { queryOne, queryAll } from '@/lib/db';
import { formatPrice, formatDateTime } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface DailyRow { date: string; revenue: number }
interface DailyOrderRow { date: string; count: number }
interface TopProductRow { name: string; revenue: number; sales: number }
interface OrderRow {
  id: string;
  customer_email: string;
  amount_cents: number;
  status: string;
  created_at: string;
  product_name: string | null;
}
interface ProductCountRow { status: string; count: number }

export default async function AdminDashboardPage() {
  const todayRevenue = (await queryOne<{ total: number }>(`
    SELECT COALESCE(SUM(amount_cents), 0) as total FROM orders WHERE status = 'completed' AND date(created_at) = date('now')
  `))?.total ?? 0;

  const weekRevenue = (await queryOne<{ total: number }>(`
    SELECT COALESCE(SUM(amount_cents), 0) as total FROM orders WHERE status = 'completed' AND created_at >= datetime('now', '-7 days')
  `))?.total ?? 0;

  const monthRevenue = (await queryOne<{ total: number }>(`
    SELECT COALESCE(SUM(amount_cents), 0) as total FROM orders WHERE status = 'completed' AND created_at >= datetime('now', '-30 days')
  `))?.total ?? 0;

  const allTimeRevenue = (await queryOne<{ total: number }>(`
    SELECT COALESCE(SUM(amount_cents), 0) as total FROM orders WHERE status = 'completed'
  `))?.total ?? 0;

  const dailyRevenue = await queryAll<DailyRow>(`
    SELECT date(created_at) as date, COALESCE(SUM(amount_cents), 0) as revenue
    FROM orders WHERE status = 'completed' AND created_at >= datetime('now', '-30 days')
    GROUP BY date(created_at) ORDER BY date ASC
  `);

  const dailyOrders = await queryAll<DailyOrderRow>(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM orders WHERE created_at >= datetime('now', '-30 days')
    GROUP BY date(created_at) ORDER BY date ASC
  `);

  const topProducts = await queryAll<TopProductRow>(`
    SELECT p.name, COALESCE(SUM(o.amount_cents), 0) as revenue, COUNT(o.id) as sales
    FROM products p LEFT JOIN orders o ON o.product_id = p.id AND o.status = 'completed'
    GROUP BY p.id ORDER BY revenue DESC LIMIT 5
  `);

  const recentOrders = await queryAll<OrderRow>(`
    SELECT o.id, o.customer_email, o.amount_cents, o.status, o.created_at, p.name as product_name
    FROM orders o LEFT JOIN products p ON p.id = o.product_id
    ORDER BY o.created_at DESC LIMIT 10
  `);

  const totalCustomers = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM customers'))?.count ?? 0;
  const totalSubscribers = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM email_subscribers WHERE unsubscribed_at IS NULL'))?.count ?? 0;

  const productCountsRaw = await queryAll<ProductCountRow>('SELECT status, COUNT(*) as count FROM products GROUP BY status');
  const productCounts: Record<string, number> = {};
  if (Array.isArray(productCountsRaw)) {
    for (const row of productCountsRaw) {
      productCounts[row.status] = row.count;
    }
  }
  const totalProducts = Object.values(productCounts).reduce((a, b) => a + b, 0);

  const maxRevenue = Math.max(...(Array.isArray(dailyRevenue) ? dailyRevenue.map(d => d.revenue) : []), 100);
  const maxOrders = Math.max(...(Array.isArray(dailyOrders) ? dailyOrders.map(d => d.count) : []), 1);
  const chartWidth = 800;
  const chartHeight = 200;

  return (
    <AdminGuard>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Today', value: todayRevenue, icon: '💰' },
            { label: 'This Week', value: weekRevenue, icon: '📈' },
            { label: 'This Month', value: monthRevenue, icon: '📊' },
            { label: 'All Time', value: allTimeRevenue, icon: '🏆' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stat.value)}</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Subscribers</p>
            <p className="text-2xl font-bold text-gray-900">{totalSubscribers}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {(productCounts['active'] ?? 0) > 0 && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {productCounts['active']} active
                </span>
              )}
              {(productCounts['draft'] ?? 0) > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  {productCounts['draft']} draft
                </span>
              )}
              {(productCounts['archived'] ?? 0) > 0 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {productCounts['archived']} archived
                </span>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Avg Order Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {Array.isArray(recentOrders) && recentOrders.length > 0
                ? formatPrice(Math.round(recentOrders.reduce((sum, o) => sum + o.amount_cents, 0) / recentOrders.length))
                : '$0.00'
              }
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Revenue (Last 30 Days)</h2>
            {Array.isArray(dailyRevenue) && dailyRevenue.length > 0 ? (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48">
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                  <line key={pct} x1="0" y1={chartHeight - pct * chartHeight} x2={chartWidth} y2={chartHeight - pct * chartHeight} stroke="#f3f4f6" strokeWidth="1" />
                ))}
                {dailyRevenue.map((day, i) => {
                  const barWidth = Math.max((chartWidth / Math.max(dailyRevenue.length, 1)) - 4, 2);
                  const barHeight = (day.revenue / maxRevenue) * chartHeight;
                  const x = i * (chartWidth / dailyRevenue.length) + 2;
                  return <rect key={day.date} x={x} y={chartHeight - barHeight} width={barWidth} height={barHeight} fill="#6366f1" rx="2" />;
                })}
              </svg>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">No revenue data yet</div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Orders Per Day (Last 30 Days)</h2>
            {Array.isArray(dailyOrders) && dailyOrders.length > 0 ? (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48">
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                  <line key={pct} x1="0" y1={chartHeight - pct * chartHeight} x2={chartWidth} y2={chartHeight - pct * chartHeight} stroke="#f3f4f6" strokeWidth="1" />
                ))}
                {dailyOrders.map((day, i) => {
                  const barWidth = Math.max((chartWidth / Math.max(dailyOrders.length, 1)) - 4, 2);
                  const barHeight = (day.count / maxOrders) * chartHeight;
                  const x = i * (chartWidth / dailyOrders.length) + 2;
                  return <rect key={day.date} x={x} y={chartHeight - barHeight} width={barWidth} height={barHeight} fill="#10b981" rx="2" />;
                })}
              </svg>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">No order data yet</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Top Products by Revenue</h2>
            {Array.isArray(topProducts) && topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} sales</p>
                    </div>
                    <span className="font-semibold text-gray-900">{formatPrice(product.revenue)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No sales yet</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recent Orders</h2>
              <Link href="/admin/orders" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View all →</Link>
            </div>
            {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{order.customer_email}</p>
                      <p className="text-xs text-gray-500">{order.product_name || 'Unknown'} · {formatDateTime(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{formatPrice(order.amount_cents)}</span>
                      <span className={`block text-xs px-2 py-0.5 rounded-full mt-0.5 ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700'
                          : order.status === 'refunded' ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>{order.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
