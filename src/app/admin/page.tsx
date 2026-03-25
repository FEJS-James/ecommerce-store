import AdminGuard from '@/components/AdminGuard';
import { queryOne, queryAll } from '@/lib/db';
import { formatPrice, formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import {
  CreditCard,
  Coins,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  BarChart3,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface DailyRow {
  date: string;
  revenue: number;
}
interface TopProductRow {
  name: string;
  revenue: number;
  sales: number;
}
interface PaymentMethodRow {
  payment_method: string;
  revenue: number;
  count: number;
}
interface OrderRow {
  id: string;
  customer_email: string;
  amount_cents: number;
  status: string;
  created_at: string;
  product_name: string | null;
  payment_method: string | null;
}

export default async function AdminDashboardPage() {
  const todayRevenue =
    (
      await queryOne<{ total: number }>(`
    SELECT COALESCE(SUM(amount_cents), 0) as total FROM orders WHERE status = 'completed' AND date(created_at) = date('now')
  `)
    )?.total ?? 0;

  const monthRevenue =
    (
      await queryOne<{ total: number }>(`
    SELECT COALESCE(SUM(amount_cents), 0) as total FROM orders WHERE status = 'completed' AND created_at >= datetime('now', '-30 days')
  `)
    )?.total ?? 0;

  const totalOrders =
    (
      await queryOne<{ count: number }>(`
    SELECT COUNT(*) as count FROM orders
  `)
    )?.count ?? 0;

  const totalCustomers =
    (
      await queryOne<{ count: number }>(
        'SELECT COUNT(*) as count FROM customers'
      )
    )?.count ?? 0;

  const yesterdayRevenue =
    (
      await queryOne<{ total: number }>(`
    SELECT COALESCE(SUM(amount_cents), 0) as total FROM orders WHERE status = 'completed' AND date(created_at) = date('now', '-1 day')
  `)
    )?.total ?? 0;

  const prevMonthRevenue =
    (
      await queryOne<{ total: number }>(`
    SELECT COALESCE(SUM(amount_cents), 0) as total FROM orders WHERE status = 'completed' AND created_at >= datetime('now', '-60 days') AND created_at < datetime('now', '-30 days')
  `)
    )?.total ?? 0;

  const prevMonthOrders =
    (
      await queryOne<{ count: number }>(`
    SELECT COUNT(*) as count FROM orders WHERE created_at >= datetime('now', '-60 days') AND created_at < datetime('now', '-30 days')
  `)
    )?.count ?? 0;

  const prevMonthCustomers =
    (
      await queryOne<{ count: number }>(`
    SELECT COUNT(*) as count FROM customers WHERE created_at < datetime('now', '-30 days')
  `)
    )?.count ?? 0;

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
    SELECT o.id, o.customer_email, o.amount_cents, o.status, o.created_at,
           p.name as product_name, COALESCE(o.payment_method, 'stripe') as payment_method
    FROM orders o LEFT JOIN products p ON p.id = o.product_id
    ORDER BY o.created_at DESC LIMIT 10
  `);

  const revenueByMethod = await queryAll<PaymentMethodRow>(`
    SELECT COALESCE(payment_method, 'stripe') as payment_method,
           COALESCE(SUM(amount_cents), 0) as revenue,
           COUNT(*) as count
    FROM orders WHERE status = 'completed'
    GROUP BY COALESCE(payment_method, 'stripe')
    ORDER BY revenue DESC
  `);

  function calcChange(current: number, previous: number): { pct: number; up: boolean } {
    if (previous === 0) return { pct: current > 0 ? 100 : 0, up: current >= 0 };
    const pct = Math.round(((current - previous) / previous) * 100);
    return { pct: Math.abs(pct), up: pct >= 0 };
  }

  const todayChange = calcChange(todayRevenue, yesterdayRevenue);
  const monthChange = calcChange(monthRevenue, prevMonthRevenue);
  const ordersChange = calcChange(totalOrders, prevMonthOrders > 0 ? totalOrders + prevMonthOrders : 0);
  const customersNewThisMonth =
    totalCustomers - (prevMonthCustomers > 0 ? prevMonthCustomers : 0);

  const maxTopRevenue = Math.max(
    ...(Array.isArray(topProducts) ? topProducts.map((p) => p.revenue) : []),
    1
  );

  const maxDailyRevenue = Math.max(
    ...(Array.isArray(dailyRevenue) ? dailyRevenue.map((d) => d.revenue) : []),
    100
  );
  const chartWidth = 800;
  const chartHeight = 200;

  const statCards = [
    {
      label: 'Today Revenue',
      value: formatPrice(todayRevenue),
      Icon: DollarSign,
      change: todayChange,
      comparison: 'vs yesterday',
    },
    {
      label: 'Month Revenue',
      value: formatPrice(monthRevenue),
      Icon: TrendingUp,
      change: monthChange,
      comparison: 'vs prev 30d',
    },
    {
      label: 'Total Orders',
      value: totalOrders.toLocaleString(),
      Icon: ShoppingCart,
      change: ordersChange,
      comparison: 'all time',
    },
    {
      label: 'Total Customers',
      value: totalCustomers.toLocaleString(),
      Icon: Users,
      change: { pct: customersNewThisMonth, up: true },
      comparison: `+${customersNewThisMonth} this month`,
    },
  ];

  return (
    <AdminGuard>
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-8">Dashboard</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="glass card-glow p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                  <stat.Icon className="w-5 h-5 text-indigo-400" aria-hidden="true" />
                </div>
              </div>
              <p className="text-3xl font-bold text-text-primary mb-2">{stat.value}</p>
              <div className="flex items-center gap-1.5 text-sm">
                {stat.change.up ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" aria-hidden="true" />
                )}
                <span className={stat.change.up ? 'text-emerald-400' : 'text-red-400'}>
                  {stat.change.pct}%
                </span>
                <span className="text-text-secondary">{stat.comparison}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="glass p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-indigo-400" aria-hidden="true" />
            <h2 className="font-semibold text-text-primary">Revenue Trend</h2>
            <span className="text-xs text-text-secondary ml-auto">Last 30 days</span>
          </div>
          {Array.isArray(dailyRevenue) && dailyRevenue.length > 0 ? (
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-48"
              role="img"
              aria-label="Revenue bar chart for the last 30 days"
            >
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                <line
                  key={pct}
                  x1="0"
                  y1={chartHeight - pct * chartHeight}
                  x2={chartWidth}
                  y2={chartHeight - pct * chartHeight}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              {dailyRevenue.map((day, i) => {
                const barWidth = Math.max(
                  chartWidth / Math.max(dailyRevenue.length, 1) - 4,
                  2
                );
                const barHeight = (day.revenue / maxDailyRevenue) * chartHeight;
                const x = i * (chartWidth / dailyRevenue.length) + 2;
                return (
                  <rect
                    key={day.date}
                    x={x}
                    y={chartHeight - barHeight}
                    width={barWidth}
                    height={barHeight}
                    fill="url(#barGrad)"
                    rx="3"
                    opacity="0.85"
                  />
                );
              })}
            </svg>
          ) : (
            <div className="h-48 flex items-center justify-center text-text-secondary">
              No revenue data yet
            </div>
          )}
        </div>

        {/* Revenue by Payment Method */}
        {Array.isArray(revenueByMethod) && revenueByMethod.length > 0 && (
          <div className="glass p-6 mb-8">
            <h2 className="font-semibold text-text-primary mb-4">
              Revenue by Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {revenueByMethod.map((method) => {
                const label =
                  method.payment_method === 'paypal'
                    ? 'PayPal'
                    : method.payment_method === 'crypto'
                      ? 'Crypto'
                      : 'Stripe';
                const IconComponent =
                  method.payment_method === 'crypto' ? Coins : CreditCard;
                const accentColor =
                  method.payment_method === 'paypal'
                    ? 'from-blue-500/20 to-blue-600/10 text-blue-400'
                    : method.payment_method === 'crypto'
                      ? 'from-orange-500/20 to-amber-600/10 text-orange-400'
                      : 'from-violet-500/20 to-indigo-600/10 text-violet-400';

                return (
                  <div
                    key={method.payment_method}
                    className="glass p-4"
                    style={{ borderRadius: '12px' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accentColor} flex items-center justify-center`}
                      >
                        <IconComponent className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <span className="font-medium text-sm text-text-primary">
                        {label}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">
                      {formatPrice(method.revenue)}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {method.count} order{method.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary">Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
              >
                View all
              </Link>
            </div>
            {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
              <div className="space-y-1">
                {recentOrders.map((order) => {
                  const PayIcon =
                    order.payment_method === 'crypto' ? Coins : CreditCard;
                  return (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between hover:bg-white/[0.03] -mx-3 px-3 py-2.5 rounded-xl transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-text-primary text-sm truncate">
                          {order.customer_email}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-text-secondary truncate">
                            {order.product_name || 'Unknown'}
                          </span>
                          <PayIcon
                            className="w-3 h-3 text-text-secondary flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-xs text-text-secondary">
                            {formatDateTime(order.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <span className="font-semibold text-text-primary text-sm">
                          {formatPrice(order.amount_cents)}
                        </span>
                        <span
                          className={`block text-xs px-2 py-0.5 rounded-full mt-1 font-medium ${
                            order.status === 'completed'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : order.status === 'refunded'
                                ? 'bg-red-500/15 text-red-400'
                                : 'bg-white/[0.08] text-text-secondary'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-text-secondary text-sm">No orders yet</p>
            )}
          </div>

          {/* Top Products */}
          <div className="glass p-6">
            <h2 className="font-semibold text-text-primary mb-4">
              Top Products by Revenue
            </h2>
            {Array.isArray(topProducts) && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => {
                  const barPct =
                    maxTopRevenue > 0
                      ? (product.revenue / maxTopRevenue) * 100
                      : 0;
                  return (
                    <div key={product.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-mono text-text-secondary w-5 text-right">
                            #{index + 1}
                          </span>
                          <p className="font-medium text-text-primary text-sm truncate">
                            {product.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          <span className="text-xs text-text-secondary">
                            {product.sales} sales
                          </span>
                          <span className="font-semibold text-text-primary text-sm">
                            {formatPrice(product.revenue)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-text-secondary text-sm">No sales yet</p>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
