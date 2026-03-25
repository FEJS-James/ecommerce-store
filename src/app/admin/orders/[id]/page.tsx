'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  CreditCard,
  Coins,
  ArrowLeft,
  Download,
  AlertTriangle,
  User,
  ShoppingCart,
} from 'lucide-react';

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
      .then((res) => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then((data) => {
        setOrder(data.order || null);
        setCustomer(data.customer || null);
        setCustomerOrders(
          Array.isArray(data.customerOrders) ? data.customerOrders : []
        );
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load order');
        setLoading(false);
      });
  }, [id]);

  async function handleRefund() {
    if (
      !order ||
      !confirm(
        'Are you sure you want to refund this order? This will also revoke download access.'
      )
    )
      return;
    setRefunding(true);
    setRefundMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/refund`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setRefundMessage(data.message || 'Refund processed successfully');
        setOrder((prev) =>
          prev
            ? { ...prev, status: 'refunded', download_token: null }
            : null
        );
      } else {
        setRefundMessage(data.error || 'Refund failed');
      }
    } catch {
      setRefundMessage('Network error during refund');
    } finally {
      setRefunding(false);
    }
  }

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

  const paymentMethod = order?.payment_method || 'stripe';
  const PayIcon = paymentMethod === 'crypto' ? Coins : CreditCard;
  const payLabel =
    paymentMethod === 'paypal'
      ? 'PayPal'
      : paymentMethod === 'crypto'
        ? 'Crypto'
        : 'Stripe';

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0A0A0F' }}>
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        {/* Breadcrumb */}
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Orders
        </Link>

        {loading ? (
          <div className="glass p-8 text-center">
            <div className="shimmer w-48 h-4 rounded mx-auto" />
          </div>
        ) : error ? (
          <div className="glass p-8 text-center border-red-500/20">
            <p className="text-red-400">{error}</p>
            <Link
              href="/admin/orders"
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mt-2 inline-block"
            >
              Back to Orders
            </Link>
          </div>
        ) : order ? (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  Order Details
                </h1>
                <p className="text-sm text-text-secondary font-mono mt-1">
                  {order.id}
                </p>
              </div>
              <span
                className={`text-sm px-3 py-1.5 rounded-full font-medium ${
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Order summary */}
                <div className="glass p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <ShoppingCart
                      className="w-5 h-5 text-indigo-400"
                      aria-hidden="true"
                    />
                    <h2 className="font-semibold text-text-primary">
                      Order Summary
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 mb-5">
                    {order.product_thumbnail ? (
                      <img
                        src={order.product_thumbnail}
                        alt={order.product_name || 'Product'}
                        className="w-16 h-16 rounded-xl object-cover border border-white/[0.08]"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary">
                        {order.product_name || 'Unknown Product'}
                      </p>
                      {order.product_id && (
                        <Link
                          href={`/admin/products/${order.product_id}/edit`}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          View product
                        </Link>
                      )}
                    </div>
                    <p className="text-xl font-bold text-text-primary">
                      {formatPrice(order.amount_cents)}
                    </p>
                  </div>
                  <div className="border-t border-white/[0.05] pt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-secondary text-xs mb-1">Date</p>
                      <p className="text-text-primary font-medium">
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-xs mb-1">
                        Currency
                      </p>
                      <p className="text-text-primary font-medium uppercase">
                        {order.currency}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment details */}
                <div className="glass p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <PayIcon
                      className="w-5 h-5 text-indigo-400"
                      aria-hidden="true"
                    />
                    <h2 className="font-semibold text-text-primary">
                      Payment Details
                    </h2>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">
                        Payment Method
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                          paymentMethod === 'paypal'
                            ? 'bg-blue-500/15 text-blue-400'
                            : paymentMethod === 'crypto'
                              ? 'bg-orange-500/15 text-orange-400'
                              : 'bg-violet-500/15 text-violet-400'
                        }`}
                      >
                        <PayIcon className="w-3 h-3" aria-hidden="true" />
                        {payLabel}
                      </span>
                    </div>
                    {paymentMethod === 'stripe' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">
                            Payment Intent
                          </span>
                          <span className="text-text-primary font-mono text-xs">
                            {order.stripe_payment_intent || '--'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">
                            Session ID
                          </span>
                          <span className="text-text-primary font-mono text-xs truncate ml-4 max-w-[300px]">
                            {order.stripe_session_id || '--'}
                          </span>
                        </div>
                      </>
                    )}
                    {paymentMethod === 'paypal' && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          PayPal Order ID
                        </span>
                        <span className="text-text-primary font-mono text-xs">
                          {order.paypal_order_id || '--'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Amount</span>
                      <span className="text-text-primary font-medium">
                        {formatPrice(order.amount_cents)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Download status */}
                <div className="glass p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Download
                      className="w-5 h-5 text-indigo-400"
                      aria-hidden="true"
                    />
                    <h2 className="font-semibold text-text-primary">
                      Download Status
                    </h2>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">
                        Download Token
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            order.download_token
                              ? 'bg-emerald-400'
                              : 'bg-red-400'
                          }`}
                          style={{
                            boxShadow: order.download_token
                              ? '0 0 8px rgba(52, 211, 153, 0.5)'
                              : '0 0 8px rgba(248, 113, 113, 0.5)',
                          }}
                        />
                        <span
                          className={`font-medium ${
                            order.download_token
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          {order.download_token ? 'Active' : 'Revoked / None'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">
                        Downloads Used
                      </span>
                      <span className="text-text-primary">
                        {order.download_count} / {order.max_downloads}
                      </span>
                    </div>
                    {order.token_expires_at && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Token Expires
                        </span>
                        <span className="text-text-primary">
                          {formatDateTime(order.token_expires_at)}
                        </span>
                      </div>
                    )}
                    {order.downloaded_at && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Last Downloaded
                        </span>
                        <span className="text-text-primary">
                          {formatDateTime(order.downloaded_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Refund */}
                {order.status !== 'refunded' && (
                  <div
                    className="glass p-6"
                    style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle
                        className="w-5 h-5 text-red-400"
                        aria-hidden="true"
                      />
                      <h2 className="font-semibold text-red-400">
                        Refund Order
                      </h2>
                    </div>
                    <p className="text-sm text-text-secondary mb-4">
                      This will refund the payment via Stripe (if applicable)
                      and revoke the customer&apos;s download access.
                    </p>
                    <button
                      onClick={handleRefund}
                      disabled={refunding}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {refunding ? 'Processing Refund...' : 'Issue Refund'}
                    </button>
                    {refundMessage && (
                      <p
                        className={`text-sm mt-3 ${
                          order.status === 'refunded'
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }`}
                      >
                        {refundMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="glass p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <User
                      className="w-5 h-5 text-indigo-400"
                      aria-hidden="true"
                    />
                    <h2 className="font-semibold text-text-primary">
                      Customer
                    </h2>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-text-secondary text-xs mb-0.5">
                        Email
                      </p>
                      <p className="text-text-primary font-medium">
                        {order.customer_email}
                      </p>
                    </div>
                    {order.customer_name && (
                      <div>
                        <p className="text-text-secondary text-xs mb-0.5">
                          Name
                        </p>
                        <p className="text-text-primary font-medium">
                          {order.customer_name}
                        </p>
                      </div>
                    )}
                    {customer && (
                      <>
                        <div className="border-t border-white/[0.05] pt-3">
                          <p className="text-text-secondary text-xs mb-0.5">
                            Total Spent
                          </p>
                          <p className="text-text-primary font-medium">
                            {formatPrice(customer.total_spent_cents)}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-secondary text-xs mb-0.5">
                            Total Orders
                          </p>
                          <p className="text-text-primary font-medium">
                            {customer.order_count}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-secondary text-xs mb-0.5">
                            Customer Since
                          </p>
                          <p className="text-text-primary font-medium">
                            {formatDateTime(customer.created_at)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {Array.isArray(customerOrders) && customerOrders.length > 0 && (
                  <div className="glass p-6">
                    <h2 className="font-semibold text-text-primary mb-4">
                      Other Orders
                    </h2>
                    <div className="space-y-2">
                      {customerOrders.map((o) => (
                        <Link
                          key={o.id}
                          href={`/admin/orders/${o.id}`}
                          className="flex items-center justify-between hover:bg-white/[0.03] -mx-2 px-2 py-2 rounded-xl transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {o.product_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {formatDateTime(o.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-text-primary">
                              {formatPrice(o.amount_cents)}
                            </p>
                            <span
                              className={`text-xs ${
                                o.status === 'completed'
                                  ? 'text-emerald-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {o.status}
                            </span>
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
