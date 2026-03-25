'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface PayPalButtonProps {
  productId: string;
  className?: string;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: Record<string, string>;
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError?: (err: unknown) => void;
        onCancel?: () => void;
      }) => { render: (selector: string | HTMLElement) => Promise<void> };
    };
  }
}

let sdkPromise: Promise<void> | null = null;

function loadPayPalSDK(clientId: string): Promise<void> {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.paypal) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&disable-funding=credit,card`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error('Failed to load PayPal SDK'));
    };
    document.head.appendChild(script);
  });

  return sdkPromise;
}

export default function PayPalButton({ productId, className = '' }: PayPalButtonProps) {
  const [error, setError] = useState('');
  const [sdkReady, setSdkReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    loadPayPalSDK(clientId)
      .then(() => setSdkReady(true))
      .catch(() => setError('Failed to load PayPal. Please try again.'));
  }, [clientId]);

  const renderButtons = useCallback(() => {
    if (!window.paypal || !containerRef.current || renderedRef.current) return;
    renderedRef.current = true;

    window.paypal
      .Buttons({
        style: {
          layout: 'horizontal',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: '55',
          tagline: 'false',
        },
        createOrder: async () => {
          setError('');
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
          });

          const data = await res.json();

          if (!res.ok || !data.orderID) {
            if (data.error === 'paypal_not_configured') {
              throw new Error('PayPal payments coming soon!');
            }
            throw new Error(data.error || 'Failed to create PayPal order');
          }

          return data.orderID;
        },
        onApprove: async (data: { orderID: string }) => {
          setCapturing(true);
          setError('');

          try {
            const res = await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderID: data.orderID,
                productId,
              }),
            });

            const captureData = await res.json();

            if (!res.ok || !captureData.success) {
              throw new Error(captureData.error || 'Payment capture failed');
            }

            // Redirect to success page with the internal order ID and verification token
            const tokenParam = captureData.token ? `&token=${captureData.token}` : '';
            window.location.href = `/order/success?order_id=${captureData.orderId}${tokenParam}`;
          } catch (err) {
            setError(
              err instanceof Error ? err.message : 'Payment failed. Please try again.'
            );
            setCapturing(false);
          }
        },
        onError: (err: unknown) => {
          console.error('PayPal error:', err);
          setError(
            err instanceof Error ? err.message : 'Something went wrong with PayPal.'
          );
        },
        onCancel: () => {
          // User closed the PayPal popup — no action needed
        },
      })
      .render(containerRef.current!);
  }, [productId]);

  useEffect(() => {
    if (sdkReady) {
      renderButtons();
    }
  }, [sdkReady, renderButtons]);

  if (!clientId) {
    return null; // PayPal not configured — don't show anything
  }

  return (
    <div className={className}>
      {capturing && (
        <div className="flex items-center justify-center gap-2 py-4 text-zinc-400">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Completing your purchase...
        </div>
      )}
      <div
        ref={containerRef}
        className={capturing ? 'hidden' : ''}
      />
      {error && (
        <p className="text-amber-400 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
