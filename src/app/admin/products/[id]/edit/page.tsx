'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import ProductForm from '@/components/ProductForm';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { Product } from '@/lib/types';
import Link from 'next/link';

export default function EditProductPage() {
  const { authenticated, checking } = useAdminAuth();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [stats, setStats] = useState<{ salesCount: number; totalRevenue: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/products/${id}`)
      .then((res) => { if (!res.ok) throw new Error('Product not found'); return res.json(); })
      .then((data) => { setProduct(data.product || null); setStats(data.stats || null); setLoading(false); })
      .catch((err) => { setError(err.message || 'Failed to load product'); setLoading(false); });
  }, [id]);

  if (checking || !authenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/admin/products" className="hover:text-gray-700">Products</Link>
          <span>/</span>
          <span className="text-gray-900">{product?.name || 'Edit Product'}</span>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Loading product...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-700">{error}</p>
            <Link href="/admin/products" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2 inline-block">← Back to Products</Link>
          </div>
        ) : product ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit: {product.name}</h1>
            <ProductForm product={product} stats={stats} />
          </>
        ) : null}
      </main>
    </div>
  );
}
