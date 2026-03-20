'use client';

import { useState } from 'react';

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
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </>
        ) : (
          <>Buy Now — {price}</>
        )}
      </button>
      {error && (
        <p className="text-amber-600 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
