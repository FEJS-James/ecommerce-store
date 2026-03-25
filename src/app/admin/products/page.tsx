'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { formatPrice, CATEGORIES } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Search, Plus, Pencil, Trash2, RotateCcw, AlertTriangle, X } from 'lucide-react';

type FilterTab = 'default' | 'active' | 'draft' | 'archived' | 'all';

function DeleteConfirmationModal({
  productNames,
  onConfirm,
  onCancel,
}: {
  productNames: string[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    await onConfirm();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative w-full max-w-md glass border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-500/15">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            Permanent Delete
          </h3>
        </div>

        <p className="text-sm text-text-secondary mb-3">
          This action <strong className="text-red-400">cannot be undone</strong>.
          The following {productNames.length === 1 ? 'product' : 'products'} will
          be permanently removed:
        </p>

        <ul className="mb-4 max-h-32 overflow-y-auto space-y-1">
          {productNames.map((name, i) => (
            <li
              key={i}
              className="text-sm text-text-primary bg-white/[0.05] px-3 py-1.5 rounded-lg truncate"
            >
              {name}
            </li>
          ))}
        </ul>

        <label className="block text-sm text-text-secondary mb-2">
          Type <strong className="text-text-primary">DELETE</strong> to confirm:
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          className="glass-input w-full px-3 py-2 rounded-xl text-sm mb-4"
          autoFocus
        />

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary bg-white/[0.05] hover:bg-white/[0.08] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmText !== 'DELETE' || deleting}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting…' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const { authenticated, checking } = useAdminAuth();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('default');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteModalProducts, setDeleteModalProducts] = useState<
    { id: string; name: string }[] | null
  >(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryFilter) params.set('category', categoryFilter);
    if (debouncedSearch) params.set('search', debouncedSearch);
    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    setAllProducts(Array.isArray(data.products) ? data.products : []);
    setSelectedIds(new Set());
    setLoading(false);
  }, [categoryFilter, debouncedSearch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Compute counts from all products
  const counts = useMemo(() => {
    const c = { active: 0, draft: 0, archived: 0, all: 0, default: 0 };
    for (const p of allProducts) {
      c.all++;
      if (p.status === 'active') {
        c.active++;
        c.default++;
      } else if (p.status === 'draft') {
        c.draft++;
        c.default++;
      } else if (p.status === 'archived') {
        c.archived++;
      }
    }
    return c;
  }, [allProducts]);

  // Filter products client-side based on active tab
  const products = useMemo(() => {
    switch (filter) {
      case 'active':
        return allProducts.filter((p) => p.status === 'active');
      case 'draft':
        return allProducts.filter((p) => p.status === 'draft');
      case 'archived':
        return allProducts.filter((p) => p.status === 'archived');
      case 'all':
        return allProducts;
      case 'default':
      default:
        return allProducts.filter((p) => p.status !== 'archived');
    }
  }, [allProducts, filter]);

  const isArchivedTab = filter === 'archived';

  async function handleStatusChange(id: string, newStatus: string) {
    await fetch(`/api/admin/products/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    loadProducts();
  }

  async function handleArchive(id: string) {
    if (!confirm('Are you sure you want to archive this product?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    loadProducts();
  }

  function openDeleteModal(productsToDelete: { id: string; name: string }[]) {
    setDeleteModalProducts(productsToDelete);
  }

  async function handlePermanentDelete() {
    if (!deleteModalProducts) return;
    await Promise.all(
      deleteModalProducts.map((p) =>
        fetch(`/api/admin/products/${p.id}/hard-delete`, { method: 'DELETE' })
      )
    );
    setDeleteModalProducts(null);
    loadProducts();
  }

  async function handleBulkRestore() {
    await Promise.all(
      Array.from(selectedIds).map((id) =>
        fetch(`/api/admin/products/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'draft' }),
        })
      )
    );
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

  // Clear selection when switching tabs
  useEffect(() => {
    setSelectedIds(new Set());
  }, [filter]);

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

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'default', label: 'Active + Draft' },
    { key: 'active', label: 'Active' },
    { key: 'draft', label: 'Draft' },
    { key: 'archived', label: 'Archived' },
    { key: 'all', label: 'All' },
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

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                filter === tab.key
                  ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 border-b-2 border-b-indigo-500'
                  : 'bg-white/[0.05] text-text-secondary border-white/[0.08] hover:bg-white/[0.08]'
              }`}
            >
              {tab.label}{' '}
              <span className="opacity-70">({counts[tab.key]})</span>
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
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
            {(categoryFilter || searchQuery) && (
              <button
                onClick={() => {
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

        {/* Bulk Action Bar (Archived tab only) */}
        {isArchivedTab && selectedIds.size > 0 && (
          <div className="glass border border-indigo-500/20 p-3 mb-4 flex items-center justify-between gap-4 rounded-xl">
            <span className="text-sm text-text-primary font-medium">
              {selectedIds.size} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkRestore}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/25 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore to Draft
              </button>
              <button
                onClick={() => {
                  const toDelete = products
                    .filter((p) => selectedIds.has(p.id))
                    .map((p) => ({ id: p.id, name: p.name }));
                  openDeleteModal(toDelete);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Permanently
              </button>
            </div>
          </div>
        )}

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
                    {isArchivedTab && (
                      <th className="text-left px-4 py-3">
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.size === products.length &&
                            products.length > 0
                          }
                          onChange={toggleSelectAll}
                          className="rounded border-white/20 bg-white/[0.05]"
                        />
                      </th>
                    )}
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
                      {isArchivedTab && (
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(product.id)}
                            onChange={() => toggleSelect(product.id)}
                            className="rounded border-white/20 bg-white/[0.05]"
                          />
                        </td>
                      )}
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
                          {product.status === 'archived' ? (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(product.id, 'draft')
                                }
                                className="p-2 rounded-lg text-text-secondary hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                                title="Restore to Draft"
                              >
                                <RotateCcw
                                  className="w-4 h-4"
                                  aria-hidden="true"
                                />
                              </button>
                              <button
                                onClick={() =>
                                  openDeleteModal([
                                    { id: product.id, name: product.name },
                                  ])
                                }
                                className="p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Delete Permanently"
                              >
                                <Trash2
                                  className="w-4 h-4"
                                  aria-hidden="true"
                                />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleArchive(product.id)}
                              className="p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Archive"
                            >
                              <Trash2
                                className="w-4 h-4"
                                aria-hidden="true"
                              />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalProducts && (
          <DeleteConfirmationModal
            productNames={deleteModalProducts.map((p) => p.name)}
            onConfirm={handlePermanentDelete}
            onCancel={() => setDeleteModalProducts(null)}
          />
        )}
      </main>
    </div>
  );
}
