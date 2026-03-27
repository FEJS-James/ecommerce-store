'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import ProductForm from '@/components/ProductForm';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { Product } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, FileText, RefreshCw } from 'lucide-react';
import ProductFilePanel from '@/components/admin/ProductFilePanel';

export default function EditProductPage() {
  const { authenticated, checking } = useAdminAuth();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [stats, setStats] = useState<{
    salesCount: number;
    totalRevenue: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then((data) => {
        setProduct(data.product || null);
        setStats(data.stats || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load product');
        setLoading(false);
      });
  }, [id]);

  async function handleRegeneratePdfs() {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/admin/products/${id}/regenerate-pdfs`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Regeneration failed');
      const count = data.result?.pdfCount ?? 0;
      // Re-fetch product data so Download button points to the new file_url
      const refreshRes = await fetch(`/api/admin/products/${id}`);
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setProduct(refreshData.product || null);
        setStats(refreshData.stats || null);
      }
      alert(`Regenerated ${count} PDF${count !== 1 ? 's' : ''} successfully`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to regenerate PDFs');
    } finally {
      setRegenerating(false);
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

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0A0A0F' }}>
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Products
        </Link>

        {loading ? (
          <div className="glass p-8 text-center">
            <div className="shimmer w-48 h-4 rounded mx-auto" />
          </div>
        ) : error ? (
          <div
            className="glass p-8 text-center"
            style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <p className="text-red-400">{error}</p>
            <Link
              href="/admin/products"
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mt-2 inline-block transition-colors"
            >
              Back to Products
            </Link>
          </div>
        ) : product ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-text-primary">
                Edit: {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRegeneratePdfs}
                  disabled={regenerating}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] text-text-secondary hover:text-text-primary transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  {regenerating ? 'Regenerating...' : 'Regenerate PDFs'}
                </button>
                <a
                  href={`/api/admin/products/${id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Preview PDF
                </a>
              </div>
            </div>
            <ProductForm product={product} stats={stats} />
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-white mb-4">Product File</h2>
              <ProductFilePanel
                productId={id}
                fileName={product.file_name}
                fileUrl={product.file_url}
                fileSizeBytes={product.file_size_bytes}
                onFileChange={() => {
                  fetch(`/api/admin/products/${id}`)
                    .then(res => res.json())
                    .then(data => setProduct(data.product || null))
                    .catch(() => {});
                }}
              />
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
