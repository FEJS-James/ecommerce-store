'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import ProductForm from '@/components/ProductForm';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { Product } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
            <h1 className="text-2xl font-bold text-text-primary mb-6">
              Edit: {product.name}
            </h1>
            <ProductForm product={product} stats={stats} />
          </>
        ) : null}
      </main>
    </div>
  );
}
