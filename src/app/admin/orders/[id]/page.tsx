'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface OrderDetail {
  id: string;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  paypal_order_id: string | null;
  payment_method: string;
  customer_email: string;
  customer_name: string | null;
  customer_id: string | null;
  product_id: string;
  product_name: string | null;
  product_slug: string | null;
  product_thumbnail: string | null;
  product_price_cents: number | null;
  amount_cents: number;
  currency: string;
  status: string;
  download_token: string | null;
  download_count: number;
  max_downloads: number;
  token_expires_at: string | null;
  downloaded_at: string | null;
  created_at: string;
}

interface CustomerInfo {
  id: string;
  email: string;
  name: string | null;
  total_spent_cents: number;
  order_count: number;
  created_at: string;
}

interface CustomerOrder {
  id: string;
  amount_cents: number;
  status: string;
  created_at: string;
  product_name: string | null;
}

export default function OrderDetailPage() {
  const { authenticated, checking } = useAdminAuth();
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refunding, setRefunding] = useState(false);
  const [refundMessage, setRefundMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/orders/${id}`)
      .then((res) => { if (!res.ok) throw new Error('Order not found'); return res.json(); })
      .then((data) => {
        setOrder(data.order || null);
        setCustomer(data.customer || null);
        setCustomerOrders(Array.isArray(data.customerOrders) ? data.customerOrders : []);
        setLoading(false);
      })
      .catch((err) => { setError(err.message || 'Failed to load order'); setLoading(false); });
  }, [id]);

  async function handleRefund() {
    if (!order || !confirm('Are you sure you want to refund this order? This will also revoke download access.')) return;
    setRefunding(true);
    setRefundMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/refund`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setRefundMessage(data.message || 'Refund processed successfully');
        setOrder((prev) => prev ? { ...prev, status: 'refunded', download_token: null } : null);
      } else {
        setRefundMessage(data.error || 'Refund failed');
      }
    } catch { setRefundMessage('Network error during refund'); }
    finally { setRefunding(false); }
  }

  if (checking || !authenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/admin/orders" className="hover:text-gray-700">Orders</Link>
          <span>/</span>
          <span className="text-gray-900">{id?.slice(0, 8)}...</span>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-700">{error}</p>
            <Link href="/admin/orders" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2 inline-block">← Back to Orders</Link>
          </div>
        ) : order ? (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                <p className="text-sm text-gray-500 font-mono">{order.id}</p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                order.status === 'completed' ? 'bg-green-100 text-green-700'
                  : order.status === 'refunded' ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>{order.status}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Order summary */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
                  <div className="flex items-center gap-4 mb-4">
                    {order.product_thumbnail ? (
                      <img src={order.product_thumbnail} alt={order.product_name || 'Product'} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center"><span className="text-2xl">📦</span></div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{order.product_name || 'Unknown Product'}</p>
                      {order.product_id && (
                        <Link href={`/admin/products/${order.product_id}/edit`} className="text-xs text-indigo-600 hover:text-indigo-800">View product →</Link>
                      )}
                    </div>
                    <p className="text-xl font-bold text-gray-900">{formatPrice(order.amount_cents)}</p>
                  </div>
                  <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-gray-500">Date</p><p className="text-gray-900 font-medium">{formatDateTime(order.created_at)}</p></div>
                    <div><p className="text-gray-500">Currency</p><p className="text-gray-900 font-medium uppercase">{order.currency}</p></div>
                  </div>
                </div>

                {/* Payment details */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Payment Details</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Method</span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        (order.payment_method || 'stripe') === 'paypal' ? 'bg-blue-100 text-blue-700'
                          : (order.payment_method || 'stripe') === 'crypto' ? 'bg-orange-100 text-orange-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {(order.payment_method || 'stripe') === 'paypal' ? 'PayPal'
                          : (order.payment_method || 'stripe') === 'crypto' ? 'Crypto'
                          : 'Stripe'}
                      </span>
                    </div>
                    {(order.payment_method || 'stripe') === 'stripe' && (
                      <>
                        <div className="flex justify-between"><span className="text-gray-500">Payment Intent</span><span className="text-gray-900 font-mono text-xs">{order.stripe_payment_intent || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Session ID</span><span className="text-gray-900 font-mono text-xs truncate ml-4 max-w-[300px]">{order.stripe_session_id || '—'}</span></div>
                      </>
                    )}
                    {order.payment_method === 'paypal' && (
                      <div className="flex justify-between"><span className="text-gray-500">PayPal Order ID</span><span className="text-gray-900 font-mono text-xs">{order.paypal_order_id || '—'}</span></div>
                    )}
                    <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="text-gray-900 font-medium">{formatPrice(order.amount_cents)}</span></div>
                  </div>
                </div>

                {/* Download status */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Download Status</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Download Token</span>
                      <span className={`font-medium ${order.download_token ? 'text-green-700' : 'text-red-600'}`}>{order.download_token ? 'Active' : 'Revoked / None'}</span>
                    </div>
                    <div className="flex justify-between"><span className="text-gray-500">Downloads Used</span><span className="text-gray-900">{order.download_count} / {order.max_downloads}</span></div>
                    {order.token_expires_at && (
                      <div className="flex justify-between"><span className="text-gray-500">Token Expires</span><span className="text-gray-900">{formatDateTime(order.token_expires_at)}</span></div>
                    )}
                    {order.downloaded_at && (
                      <div className="flex justify-between"><span className="text-gray-500">Last Downloaded</span><span className="text-gray-900">{formatDateTime(order.downloaded_at)}</span></div>
                    )}
                  </div>
                </div>

                {/* Refund */}
                {order.status !== 'refunded' && (
                  <div className="bg-white rounded-xl border border-red-200 p-6">
                    <h2 className="font-semibold text-red-700 mb-2">Refund Order</h2>
                    <p className="text-sm text-gray-500 mb-4">This will refund the payment via Stripe (if applicable) and revoke the customer&apos;s download access.</p>
                    <button onClick={handleRefund} disabled={refunding} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                      {refunding ? 'Processing Refund...' : '💸 Issue Refund'}
                    </button>
                    {refundMessage && <p className={`text-sm mt-2 ${order.status === 'refunded' ? 'text-green-600' : 'text-red-600'}`}>{refundMessage}</p>}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">Customer</h2>
                  <div className="space-y-3 text-sm">
                    <div><p className="text-gray-500">Email</p><p className="text-gray-900 font-medium">{order.customer_email}</p></div>
                    {order.customer_name && <div><p className="text-gray-500">Name</p><p className="text-gray-900 font-medium">{order.customer_name}</p></div>}
                    {customer && (
                      <>
                        <div><p className="text-gray-500">Total Spent</p><p className="text-gray-900 font-medium">{formatPrice(customer.total_spent_cents)}</p></div>
                        <div><p className="text-gray-500">Total Orders</p><p className="text-gray-900 font-medium">{customer.order_count}</p></div>
                        <div><p className="text-gray-500">Customer Since</p><p className="text-gray-900 font-medium">{formatDateTime(customer.created_at)}</p></div>
                      </>
                    )}
                  </div>
                </div>

                {customerOrders.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Other Orders</h2>
                    <div className="space-y-3">
                      {customerOrders.map((o) => (
                        <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{o.product_name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{formatDateTime(o.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{formatPrice(o.amount_cents)}</p>
                            <span className={`text-xs ${o.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>{o.status}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
