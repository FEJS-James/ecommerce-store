'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  CreditCard,
  Coins,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';

interface OrderRow {
  id: string;
  customer_email: string;
  customer_name: string | null;
  product_name: string | null;
  amount_cents: number;
  status: string;
  payment_method: string;
  created_at: string;
}

function PaymentMethodBadge({ method }: { method: string }) {
  const config: Record<string, { label: string; Icon: typeof CreditCard; classes: string }> = {
    paypal: {
      label: 'PayPal',
      Icon: CreditCard,
      classes: 'bg-blue-500/15 text-blue-400',
    },
    crypto: {
      label: 'Crypto',
      Icon: Coins,
      classes: 'bg-orange-500/15 text-orange-400',
    },
    stripe: {
      label: 'Stripe',
      Icon: CreditCard,
      classes: 'bg-violet-500/15 text-violet-400',
    },
  };
  const c = config[method] || config.stripe;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${c.classes}`}
    >
      <c.Icon className="w-3 h-3" aria-hidden="true" />
      {c.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes =
    status === 'completed'
      ? 'bg-emerald-500/15 text-emerald-400'
      : status === 'refunded'
        ? 'bg-red-500/15 text-red-400'
        : 'bg-white/[0.08] text-text-secondary';
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${classes}`}>
      {status}
    </span>
  );
}

export default function AdminOrdersPage() {
  const { authenticated, checking } = useAdminAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    if (statusFilter) params.set('status', statusFilter);
    if (paymentMethodFilter) params.set('payment_method', paymentMethodFilter);
    if (debouncedSearch) params.set('search', debouncedSearch);
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(Array.isArray(data.orders) ? data.orders : []);
    setLoading(false);
  }, [startDate, endDate, statusFilter, paymentMethodFilter, debouncedSearch]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (checking || !authenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0A0A0F' }}
      >
        <div className="shimmer w-32 h-4 rounded" />
      </div>
    );
  }

  const hasFilters =
    startDate || endDate || statusFilter || paymentMethodFilter || searchQuery;

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'completed', label: 'Completed' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'pending', label: 'Pending' },
  ];

  const paymentFilters = [
    { value: '', label: 'All Payments' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'crypto', label: 'Crypto' },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0A0A0F' }}>
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Orders</h1>

        {/* Filters */}
        <div className="glass p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px] relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email..."
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statusFilters.map((sf) => (
                <button
                  key={sf.value}
                  onClick={() => setStatusFilter(sf.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    statusFilter === sf.value
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-white/[0.05] text-text-secondary border border-white/[0.08] hover:bg-white/[0.08]'
                  }`}
                >
                  {sf.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {paymentFilters.map((pf) => (
                <button
                  key={pf.value}
                  onClick={() => setPaymentMethodFilter(pf.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    paymentMethodFilter === pf.value
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-white/[0.05] text-text-secondary border border-white/[0.08] hover:bg-white/[0.08]'
                  }`}
                >
                  {pf.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="glass-input px-3 py-2.5 rounded-xl text-sm"
                aria-label="Start date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="glass-input px-3 py-2.5 rounded-xl text-sm"
                aria-label="End date"
              />
            </div>
            {hasFilters && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setStatusFilter('');
                  setPaymentMethodFilter('');
                  setSearchQuery('');
                }}
                className="text-sm text-text-secondary hover:text-text-primary px-3 py-2 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="glass p-8 text-center">
            <div className="shimmer w-48 h-4 rounded mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="glass p-8 text-center text-text-secondary">
            {hasFilters ? 'No orders match your filters' : 'No orders yet'}
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="w-8 px-4 py-3" />
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider hidden md:table-cell">
                      Product
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider hidden sm:table-cell">
                      Payment
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider hidden lg:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {orders.map((order) => (
                    <>
                      <tr
                        key={order.id}
                        className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                        onClick={() =>
                          setExpandedId(
                            expandedId === order.id ? null : order.id
                          )
                        }
                      >
                        <td className="px-4 py-4">
                          {expandedId === order.id ? (
                            <ChevronUp
                              className="w-4 h-4 text-text-secondary"
                              aria-hidden="true"
                            />
                          ) : (
                            <ChevronDown
                              className="w-4 h-4 text-text-secondary"
                              aria-hidden="true"
                            />
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-mono text-indigo-400">
                            {order.id.slice(0, 8)}...
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-text-primary">
                            {order.customer_email}
                          </p>
                          {order.customer_name && (
                            <p className="text-xs text-text-secondary">
                              {order.customer_name}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-text-primary hidden md:table-cell">
                          {order.product_name || 'Unknown'}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-text-primary">
                          {formatPrice(order.amount_cents)}
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <PaymentMethodBadge
                            method={order.payment_method || 'stripe'}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-4 text-sm text-text-secondary hidden lg:table-cell">
                          {formatDateTime(order.created_at)}
                        </td>
                      </tr>
                      {expandedId === order.id && (
                        <tr key={`${order.id}-detail`}>
                          <td
                            colSpan={8}
                            className="px-4 py-4 bg-white/[0.02]"
                          >
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-text-secondary text-xs mb-1">
                                  Full Order ID
                                </p>
                                <p className="text-text-primary font-mono text-xs break-all">
                                  {order.id}
                                </p>
                              </div>
                              <div>
                                <p className="text-text-secondary text-xs mb-1">
                                  Customer
                                </p>
                                <p className="text-text-primary">
                                  {order.customer_email}
                                </p>
                                {order.customer_name && (
                                  <p className="text-text-secondary text-xs">
                                    {order.customer_name}
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="text-text-secondary text-xs mb-1">
                                  Product
                                </p>
                                <p className="text-text-primary">
                                  {order.product_name || 'Unknown'}
                                </p>
                              </div>
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-text-secondary text-xs mb-1">
                                    Date
                                  </p>
                                  <p className="text-text-primary">
                                    {formatDateTime(order.created_at)}
                                  </p>
                                </div>
                                <Link
                                  href={`/admin/orders/${order.id}`}
                                  className="p-2 rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                                  title="View details"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink
                                    className="w-4 h-4"
                                    aria-hidden="true"
                                  />
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
