'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { formatPrice } from '@/lib/utils';
import type { Product, Order } from '@/lib/types';

interface OrderWithProduct extends Order {
  product_name?: string;
  product_slug?: string;
  product_category?: string;
}

function ThankYouContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<OrderWithProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    fetch(`/api/admin/orders?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
          if (data.relatedProducts) {
            setRelatedProducts(data.relatedProducts);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto" />
          <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto" />
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Thanks for your purchase!
        </h1>
        <p className="text-lg text-gray-500">
          {order
            ? `Your order for ${order.product_name || 'your product'} has been confirmed.`
            : 'Your order has been confirmed. Check your email for download instructions.'}
        </p>
      </div>

      {order && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-12">
          <h2 className="font-semibold text-gray-900 text-lg mb-4">Order Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Product</span>
              <span className="font-medium text-gray-900">{order.product_name || 'Digital Product'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium text-gray-900">{formatPrice(order.amount_cents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-900">{order.customer_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="inline-flex items-center gap-1 font-medium text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Completed
              </span>
            </div>
          </div>

          {order.download_token && (
            <div className="mt-6 pt-6 border-t">
              <a
                href={`/api/download/${order.download_token}`}
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-semibold text-center transition-colors"
              >
                ⬇️ Download Your Product
              </a>
              <p className="text-gray-400 text-xs mt-2 text-center">
                You can download this up to {order.max_downloads} times.
              </p>
            </div>
          )}
        </div>
      )}

      {!order && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-12 text-center">
          <p className="text-gray-500 mb-4">
            We&apos;ve sent a confirmation email with your download link.
          </p>
          <Link
            href="/products"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Continue Shopping →
          </Link>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto" />
          <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto" />
        </div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
