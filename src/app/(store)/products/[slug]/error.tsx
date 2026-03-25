"use client";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
      <p className="text-zinc-400 mb-6">We couldn&apos;t load this product. Please try again.</p>
      <button
        onClick={reset}
        className="btn-gradient px-6 py-3 rounded-xl font-semibold"
      >
        Try again
      </button>
    </div>
  );
}
