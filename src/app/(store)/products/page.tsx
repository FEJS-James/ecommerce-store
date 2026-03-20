'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import ProductCard from '@/components/ProductCard';
import { CATEGORIES } from '@/lib/utils';
import type { Product } from '@/lib/types';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/products?status=active`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    if (category === 'all') return true;
    return p.category === category;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'price-low':
        return a.price_cents - b.price_cents;
      case 'price-high':
        return b.price_cents - a.price_cents;
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'featured':
      default:
        return b.featured - a.featured;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">All Products</h1>
        <p className="text-lg text-gray-500">Premium digital products for creators and professionals</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 flex-1">
          <button
            onClick={() => setCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="aspect-[3/2] bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-6 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
