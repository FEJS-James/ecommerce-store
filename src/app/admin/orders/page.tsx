'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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
  switch (method) {
    case 'paypal':
      return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">PayPal</span>;
    case 'crypto':
      return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">₿ Crypto</span>;
    default:
      return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">Stripe</span>;
  }
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

  useEffect(() => { loadOrders(); }, [loadOrders]);

  if (checking || !authenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading...</p></div>;
  }

  const hasFilters = startDate || endDate || statusFilter || paymentMethodFilter || searchQuery;

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Payment</label>
              <select value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="crypto">Crypto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Search by email</label>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="customer@email.com" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {hasFilters && (
              <button onClick={() => { setStartDate(''); setEndDate(''); setStatusFilter(''); setPaymentMethodFilter(''); setSearchQuery(''); }} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">Clear filters</button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">{hasFilters ? 'No orders match your filters' : 'No orders yet'}</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Payment</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <Link href={`/admin/orders/${order.id}`} className="text-sm font-mono text-indigo-600 hover:text-indigo-800">{order.id.slice(0, 8)}...</Link>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{formatDateTime(order.created_at)}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">{order.customer_email}</p>
                        {order.customer_name && <p className="text-xs text-gray-500">{order.customer_name}</p>}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 hidden md:table-cell">{order.product_name || 'Unknown'}</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatPrice(order.amount_cents)}</td>
                      <td className="px-4 py-4 hidden sm:table-cell"><PaymentMethodBadge method={order.payment_method || 'stripe'} /></td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700'
                            : order.status === 'refunded' ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>{order.status}</span>
                      </td>
                    </tr>
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
