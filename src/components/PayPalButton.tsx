"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PayPalButtonProps {
  productId: string;
  className?: string;
  /** If false, the PayPal button area is hidden */
  consentGiven?: boolean;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: Record<string, string | number | boolean>;
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

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&disable-funding=credit,card`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Failed to load PayPal SDK"));
    };
    document.head.appendChild(script);
  });

  return sdkPromise;
}

/**
 * Fetches the PayPal client ID from a runtime API endpoint.
 * This avoids the Next.js build-time inlining problem with
 * NEXT_PUBLIC_* env vars -- the value is read server-side at
 * request time, so it works even if set after deployment.
 */
async function fetchClientId(): Promise<string | null> {
  // First, check the build-time value (works when env var was present at build)
  const buildTime = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  if (buildTime) return buildTime;

  // Fall back to runtime endpoint
  try {
    const res = await fetch("/api/config/paypal", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.clientId ?? null;
  } catch {
    return null;
  }
}

export default function PayPalButton({
  productId,
  className = "",
  consentGiven = true,
}: PayPalButtonProps) {
  const [error, setError] = useState("");
  const [sdkReady, setSdkReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  // Resolve client ID (build-time or runtime fallback)
  useEffect(() => {
    let cancelled = false;

    if (clientId) {
      // Already have it from build-time env var
      setLoading(false);
      return;
    }

    fetchClientId().then((id) => {
      if (cancelled) return;
      setClientId(id);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load the PayPal SDK once we have a client ID
  useEffect(() => {
    if (!clientId) return;

    loadPayPalSDK(clientId)
      .then(() => setSdkReady(true))
      .catch(() => setError("Failed to load PayPal. Please try again."));
  }, [clientId]);

  const renderButtons = useCallback(() => {
    if (!window.paypal || !containerRef.current || renderedRef.current) return;
    renderedRef.current = true;

    try {
      window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 55,
            tagline: false,
          },
          createOrder: async () => {
            setError("");
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId }),
            });

            const data = await res.json();

            if (!res.ok || !data.orderID) {
              if (data.error === "paypal_not_configured") {
                throw new Error("PayPal payments coming soon!");
              }
              throw new Error(data.error || "Failed to create PayPal order");
            }

            return data.orderID;
          },
          onApprove: async (data: { orderID: string }) => {
            setCapturing(true);
            setError("");

            try {
              const res = await fetch("/api/paypal/capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderID: data.orderID,
                  productId,
                }),
              });

              const captureData = await res.json();

              if (!res.ok || !captureData.success) {
                throw new Error(captureData.error || "Payment capture failed");
              }

              // Redirect to success page with the internal order ID and verification token
              const tokenParam = captureData.token
                ? `&token=${captureData.token}`
                : "";
              window.location.href = `/order/success?order_id=${captureData.orderId}${tokenParam}`;
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Payment failed. Please try again.",
              );
              setCapturing(false);
            }
          },
          onError: (err: unknown) => {
            console.error("PayPal error:", err);
            setError(
              err instanceof Error
                ? err.message
                : "Something went wrong with PayPal.",
            );
          },
          onCancel: () => {
            // User closed the PayPal popup -- no action needed
          },
        })
        .render(containerRef.current!)
        .catch((err: unknown) => {
          console.error("PayPal Buttons render failed:", err);
          renderedRef.current = false;
          setError(
            "PayPal is temporarily unavailable. Please use another payment method.",
          );
        });
    } catch (err) {
      // Catches synchronous Buttons() constructor errors
      console.error("PayPal Buttons init failed:", err);
      renderedRef.current = false;
      setError(
        "PayPal is temporarily unavailable. Please use another payment method.",
      );
    }
  }, [productId]);

  useEffect(() => {
    if (sdkReady) {
      renderButtons();
    }
  }, [sdkReady, renderButtons]);

  // Always render the container so the UI never silently hides PayPal.
  // Show a loading placeholder while the SDK is being fetched / resolved.
  // If client ID is genuinely absent (not configured), hide gracefully.
  if (!loading && !clientId) {
    // PayPal is not configured at all -- nothing to show
    return null;
  }

  return (
    <div className={className}>
      {/* "or pay with PayPal" divider -- always visible while loading or ready */}
      {(loading || !sdkReady) && !capturing && !error && (
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 border-t border-zinc-700" />
          <span className="text-zinc-400 text-sm">or pay with PayPal</span>
          <div className="flex-1 border-t border-zinc-700" />
        </div>
      )}

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

      {/* Loading skeleton while SDK initializes */}
      {loading && !capturing && (
        <div className="h-[55px] rounded bg-zinc-800 animate-pulse flex items-center justify-center">
          <span className="text-zinc-500 text-sm">Loading PayPal...</span>
        </div>
      )}

      <div className={`relative ${capturing || loading ? "hidden" : ""}`}>
        {!consentGiven && (
          <div
            className="absolute inset-0 z-10 rounded-lg"
            style={{ background: "rgba(10, 10, 15, 0.7)" }}
            title="Please agree to the terms before purchasing"
          />
        )}
        <div
          ref={containerRef}
          className={!consentGiven ? "pointer-events-none" : ""}
        />
      </div>
      {error && (
        <p className="text-amber-400 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
