import AdminGuard from '@/components/AdminGuard';
import { queryOne, queryAll } from '@/lib/db';
import { formatPrice, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface DailyRow { date: string; revenue: number }
interface TopProductRow { name: string; revenue: number; sales: number }
interface OrderRow {
  id: string;
  customer_email: string;
  amount_cents: number;
  status: string;
  created_at: string;
  product_name: string | null;
}

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

  // Build SVG chart
  const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 100);
  const chartWidth = 800;
  const chartHeight = 200;

  return (
    <AdminGuard>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Today', value: todayRevenue, color: 'bg-indigo-50 text-indigo-700' },
            { label: 'This Week', value: weekRevenue, color: 'bg-green-50 text-green-700' },
            { label: 'This Month', value: monthRevenue, color: 'bg-blue-50 text-blue-700' },
            { label: 'All Time', value: allTimeRevenue, color: 'bg-purple-50 text-purple-700' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stat.value)}</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Email Subscribers</p>
            <p className="text-2xl font-bold text-gray-900">{totalSubscribers}</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue (Last 30 Days)</h2>
          {dailyRevenue.length > 0 ? (
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                <line
                  key={pct}
                  x1="0"
                  y1={chartHeight - pct * chartHeight}
                  x2={chartWidth}
                  y2={chartHeight - pct * chartHeight}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              ))}
              {/* Bars */}
              {dailyRevenue.map((day, i) => {
                const barWidth = Math.max((chartWidth / Math.max(dailyRevenue.length, 1)) - 4, 2);
                const barHeight = (day.revenue / maxRevenue) * chartHeight;
                const x = i * (chartWidth / dailyRevenue.length) + 2;
                return (
                  <rect
                    key={day.date}
                    x={x}
                    y={chartHeight - barHeight}
                    width={barWidth}
                    height={barHeight}
                    fill="#6366f1"
                    rx="2"
                  />
                );
              })}
            </svg>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              No revenue data yet
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Top Products by Revenue</h2>
            {topProducts.length > 0 ? (
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

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Recent Orders</h2>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{order.customer_email}</p>
                      <p className="text-xs text-gray-500">{order.product_name || 'Unknown'} · {formatDateTime(order.created_at)}</p>
                    </div>
                    <span className="font-semibold text-gray-900">{formatPrice(order.amount_cents)}</span>
                  </div>
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
