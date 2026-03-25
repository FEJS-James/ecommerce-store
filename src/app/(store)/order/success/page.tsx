'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { formatPrice } from '@/lib/utils';
import { CheckCircle2, Download, KeyRound } from 'lucide-react';
import type { Product, Order } from '@/lib/types';

interface OrderWithProduct extends Order {
  product_name?: string;
  product_slug?: string;
  product_category?: string;
}

function AccountPrompt({ email }: { email: string }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/account/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('Account created! You can now access your purchases anytime.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to create account');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="glass rounded-2xl p-6 text-center border border-emerald-500/20">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          <p className="text-emerald-300 font-medium">{message}</p>
        </div>
        <Link
          href="/account"
          className="inline-block mt-2 text-indigo-400 hover:text-indigo-300 font-medium text-sm"
        >
          Go to My Account
        </Link>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 border border-indigo-500/20">
      <div className="flex items-center gap-2 mb-2">
        <KeyRound className="w-5 h-5 text-indigo-400" aria-hidden="true" />
        <h3 className="font-semibold text-white">Create Your Account</h3>
      </div>
      <p className="text-zinc-500 text-sm mb-4">
        Set a password to access your purchases, re-download files, and track orders anytime.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password (min 8 characters)"
          required
          minLength={8}
          className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          required
          minLength={8}
          className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
        />
        {status === 'error' && (
          <p className="text-red-400 text-sm">{message}</p>
        )}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full btn-gradient px-6 py-2.5 rounded-lg font-medium text-sm disabled:opacity-50 focus-glow"
        >
          {status === 'loading' ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<OrderWithProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/account/me')
      .then((res) => {
        if (res.ok) setIsLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    fetch(`/api/orders/lookup?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
          if (Array.isArray(data.relatedProducts)) {
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
        <div className="space-y-4">
          <div className="h-16 w-16 rounded-full mx-auto shimmer" />
          <div className="h-8 rounded w-2/3 mx-auto shimmer" />
          <div className="h-6 rounded w-1/2 mx-auto shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
          <CheckCircle2 className="w-8 h-8 text-emerald-400" aria-hidden="true" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Thanks for your purchase!
        </h1>
        <p className="text-lg text-zinc-500">
          {order
            ? `Your order for ${order.product_name || 'your product'} has been confirmed.`
            : 'Your order has been confirmed. Check your email for download instructions.'}
        </p>
      </div>

      {order && (
        <div className="glass rounded-2xl p-8 mb-8">
          <h2 className="font-semibold text-white text-lg mb-6">Order Details</h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Product</span>
              <span className="font-medium text-white">{order.product_name || 'Digital Product'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Amount</span>
              <span className="font-medium text-white">{formatPrice(order.amount_cents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Email</span>
              <span className="font-medium text-white">{order.customer_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Status</span>
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                Completed
              </span>
            </div>
          </div>

          {order.download_token && (
            <div className="mt-6 pt-6 border-t border-white/[0.06]">
              <a
                href={`/api/download/${order.download_token}`}
                className="flex items-center justify-center gap-2 w-full btn-gradient px-6 py-4 rounded-xl font-semibold text-center focus-glow"
              >
                <Download className="w-5 h-5" aria-hidden="true" />
                Download Your Product
              </a>
              <p className="text-zinc-600 text-xs mt-2 text-center">
                You can download this up to {order.max_downloads} times.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Account creation prompt if not logged in */}
      {order && !isLoggedIn && (
        <div className="mb-8">
          <AccountPrompt email={order.customer_email} />
        </div>
      )}

      {/* Logged in — link to account */}
      {order && isLoggedIn && (
        <div className="glass rounded-2xl p-6 mb-8 text-center">
          <p className="text-zinc-400 mb-3">Your purchase has been added to your account.</p>
          <Link
            href="/account"
            className="inline-block btn-ghost px-6 py-2.5 rounded-lg font-medium text-sm focus-glow"
          >
            View My Account
          </Link>
        </div>
      )}

      {!order && (
        <div className="glass rounded-2xl p-8 mb-12 text-center">
          <p className="text-zinc-500 mb-4">
            We&apos;ve sent a confirmation email with your download link.
          </p>
          <Link
            href="/products"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Related Products */}
      {Array.isArray(relatedProducts) && relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-white/[0.06]">
          <h2 className="text-2xl font-bold text-white mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="space-y-4">
          <div className="h-16 w-16 rounded-full mx-auto shimmer" />
          <div className="h-8 rounded w-2/3 mx-auto shimmer" />
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
