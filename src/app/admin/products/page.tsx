'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { formatPrice, CATEGORIES } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminProductsPage() {
  const { authenticated, checking } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (categoryFilter) params.set('category', categoryFilter);
    if (debouncedSearch) params.set('search', debouncedSearch);
    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    setProducts(Array.isArray(data.products) ? data.products : []);
    setSelectedIds(new Set());
    setLoading(false);
  }, [statusFilter, categoryFilter, debouncedSearch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleStatusChange(id: string, newStatus: string) {
    await fetch(`/api/admin/products/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    loadProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to archive this product?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    loadProducts();
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
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

  const statusFilters = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0A0A0F' }}>
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-text-primary">Products</h1>
          <Link
            href="/admin/products/new"
            className="btn-gradient px-5 py-2.5 rounded-xl font-medium text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Create Product
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="glass p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statusFilters.map((sf) => (
                <button
                  key={sf.value}
                  onClick={() => setStatusFilter(sf.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    statusFilter === sf.value
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-white/[0.05] text-text-secondary border border-white/[0.08] hover:bg-white/[0.08]'
                  }`}
                >
                  {sf.label}
                </button>
              ))}
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="glass-input px-3 py-2.5 rounded-xl text-sm"
            >
              <option value="">All categories</option>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>
                  {cat.label}
                </option>
              ))}
            </select>
            {(statusFilter || categoryFilter || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setCategoryFilter('');
                  setSearchQuery('');
                }}
                className="text-sm text-text-secondary hover:text-text-primary px-3 py-2 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="glass p-8 text-center">
            <div className="shimmer w-48 h-4 rounded mx-auto" />
          </div>
        ) : products.length === 0 ? (
          <div className="glass p-8 text-center text-text-secondary">
            No products found
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === products.length && products.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-white/20 bg-white/[0.05]"
                      />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider hidden md:table-cell">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider hidden lg:table-cell">
                      Sales
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="rounded border-white/20 bg-white/[0.05]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {product.thumbnail_url ? (
                            <img
                              src={product.thumbnail_url}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/[0.08]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0 border border-white/[0.08]">
                              <span className="text-text-secondary text-xs">
                                --
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-text-primary text-sm truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-text-secondary truncate">
                              /{product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-text-primary">
                          {formatPrice(product.price_cents)}
                        </p>
                        {product.compare_price_cents &&
                          product.compare_price_cents > product.price_cents && (
                            <p className="text-xs text-text-secondary line-through">
                              {formatPrice(product.compare_price_cents)}
                            </p>
                          )}
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-xs bg-white/[0.08] text-text-secondary px-2 py-1 rounded-full">
                          {CATEGORIES[product.category]?.label ||
                            product.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={product.status}
                          onChange={(e) =>
                            handleStatusChange(product.id, e.target.value)
                          }
                          className={`text-xs px-2.5 py-1 rounded-full font-medium border-0 cursor-pointer appearance-none ${
                            product.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : product.status === 'draft'
                                ? 'bg-yellow-500/15 text-yellow-400'
                                : 'bg-white/[0.08] text-text-secondary'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <p className="text-sm text-text-primary">
                          {product.download_count}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 rounded-lg text-text-secondary hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" aria-hidden="true" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
