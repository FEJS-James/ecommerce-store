'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface BuyButtonProps {
  productId: string;
  price: string;
  className?: string;
}

export default function BuyButton({ productId, price, className = '' }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleBuy() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === 'stripe_not_configured') {
        setError('Payments coming soon! Check back shortly.');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full btn-gradient px-8 py-4 rounded-xl font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-2 focus-glow"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            Processing...
          </>
        ) : (
          <>Buy Now — {price}</>
        )}
      </button>
      {error && (
        <p className="text-amber-400 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
