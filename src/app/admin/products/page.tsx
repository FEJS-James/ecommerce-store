'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { formatPrice, CATEGORIES, slugify } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminProductsPage() {
  const { authenticated, checking } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleStatusToggle(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    loadProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    loadProducts();
  }

  if (checking || !authenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <button
            onClick={() => { setEditingProduct(null); setShowForm(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Add Product
          </button>
        </div>

        {showForm && (
          <ProductForm
            product={editingProduct}
            onClose={() => { setShowForm(false); setEditingProduct(null); }}
            onSaved={() => { setShowForm(false); setEditingProduct(null); loadProducts(); }}
          />
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">File</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Downloads</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">/{product.slug}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatPrice(product.price_cents)}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {CATEGORIES[product.category]?.label || product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.file_url ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {product.file_name || 'Uploaded'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            No file
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleStatusToggle(product.id, product.status)}
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            product.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : product.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {product.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.download_count}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { setEditingProduct(product); setShowForm(true); }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
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

// ---------------------------------------------------------------------------
// Product Form with file upload + preview image management
// ---------------------------------------------------------------------------
interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    price_cents: product?.price_cents || 0,
    compare_price_cents: product?.compare_price_cents || 0,
    category: product?.category || 'prompt-packs',
    tags: product?.tags || '[]',
    file_url: product?.file_url || '',
    file_name: product?.file_name || '',
    thumbnail_url: product?.thumbnail_url || '',
    status: product?.status || 'active',
    featured: product?.featured || 0,
  });
  const [saving, setSaving] = useState(false);

  // File upload state
  const [fileUploading, setFileUploading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [fileSuccess, setFileSuccess] = useState('');
  const [currentFile, setCurrentFile] = useState<{
    name: string;
    size: number;
  } | null>(
    product?.file_name
      ? { name: product.file_name, size: product.file_size_bytes }
      : null
  );

  // Preview images state
  const [previewImages, setPreviewImages] = useState<string[]>(() => {
    try {
      return JSON.parse(product?.preview_images || '[]');
    } catch {
      return [];
    }
  });
  const [previewUploading, setPreviewUploading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'name' && !product) {
      setForm((prev) => ({ ...prev, slug: slugify(value as string) }));
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !product) return;

    setFileError('');
    setFileSuccess('');
    setFileUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/admin/products/${product.id}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setFileError(data.error || 'Upload failed');
      } else {
        setFileSuccess(`Uploaded: ${data.file.name} (${formatBytes(data.file.size)})`);
        setCurrentFile({ name: data.file.name, size: data.file.size });
        setForm((prev) => ({
          ...prev,
          file_url: data.file.url,
          file_name: data.file.name,
        }));
      }
    } catch {
      setFileError('Network error during upload');
    } finally {
      setFileUploading(false);
      // Reset input so the same file can be re-selected
      e.target.value = '';
    }
  }

  async function handlePreviewUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0 || !product) return;

    setPreviewError('');
    setPreviewUploading(true);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const res = await fetch(`/api/admin/products/${product.id}/previews`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setPreviewError(data.error || 'Upload failed');
      } else {
        setPreviewImages(data.preview_images || []);
      }
    } catch {
      setPreviewError('Network error during upload');
    } finally {
      setPreviewUploading(false);
      e.target.value = '';
    }
  }

  async function handlePreviewDelete(url: string) {
    if (!product || !confirm('Remove this preview image?')) return;

    try {
      const res = await fetch(`/api/admin/products/${product.id}/previews`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewImages(data.preview_images || []);
      }
    } catch {
      // Silently fail — image may already be gone
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products';
    const method = product ? 'PATCH' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        compare_price_cents: form.compare_price_cents || null,
        file_url: form.file_url || null,
        file_name: form.file_name || null,
      }),
    });

    setSaving(false);
    onSaved();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {product ? 'Edit Product' : 'Create Product'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => updateField('slug', e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <input
            type="text"
            value={form.short_description}
            onChange={(e) => updateField('short_description', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Description (Markdown)</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm font-mono"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (cents)</label>
            <input
              type="number"
              value={form.price_cents}
              onChange={(e) => updateField('price_cents', parseInt(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compare Price (cents)</label>
            <input
              type="number"
              value={form.compare_price_cents}
              onChange={(e) => updateField('compare_price_cents', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
            >
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
            <input
              type="url"
              value={form.thumbnail_url}
              onChange={(e) => updateField('thumbnail_url', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (JSON array)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => updateField('tags', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!form.featured}
                onChange={(e) => updateField('featured', e.target.checked ? 1 : 0)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Featured Product</span>
            </label>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Product File Upload (only shown when editing existing product) */}
        {/* ------------------------------------------------------------ */}
        {product && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              📎 Product File
            </h3>

            {currentFile ? (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <span className="text-green-600 text-lg">✅</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 truncate">{currentFile.name}</p>
                  <p className="text-xs text-green-600">{formatBytes(currentFile.size)}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                <span className="text-yellow-600 text-lg">⚠️</span>
                <p className="text-sm text-yellow-800">No file uploaded yet. Customers won&apos;t be able to download anything.</p>
              </div>
            )}

            <div>
              <label className="block">
                <span className="sr-only">Upload product file</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={fileUploading}
                  accept=".pdf,.zip,.xlsx,.csv,.png,.jpg,.jpeg"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">PDF, ZIP, XLSX, CSV, PNG, JPG — max 50MB</p>
            </div>

            {fileUploading && (
              <div className="flex items-center gap-2 text-sm text-indigo-600">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading...
              </div>
            )}
            {fileError && <p className="text-sm text-red-600">{fileError}</p>}
            {fileSuccess && <p className="text-sm text-green-600">{fileSuccess}</p>}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* Preview Images (only shown when editing existing product)      */}
        {/* ------------------------------------------------------------ */}
        {product && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              🖼️ Preview Images
            </h3>

            {previewImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {previewImages.map((url, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt={`Preview ${i + 1}`} className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => handlePreviewDelete(url)}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No preview images yet.</p>
            )}

            <div>
              <label className="block">
                <span className="sr-only">Upload preview images</span>
                <input
                  type="file"
                  onChange={handlePreviewUpload}
                  disabled={previewUploading}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP, GIF — max 10MB each. Select multiple files at once.</p>
            </div>

            {previewUploading && (
              <div className="flex items-center gap-2 text-sm text-indigo-600">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading previews...
              </div>
            )}
            {previewError && <p className="text-sm text-red-600">{previewError}</p>}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
