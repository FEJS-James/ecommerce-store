'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { slugify, CATEGORIES, formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

interface ProductFormProps {
  product?: Product | null;
  stats?: { salesCount: number; totalRevenue: number } | null;
}

export default function ProductForm({ product, stats }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

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
    status: product?.status || 'draft',
    featured: product?.featured || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [fileSuccess, setFileSuccess] = useState('');
  const [currentFile, setCurrentFile] = useState<{ name: string; size: number } | null>(
    product?.file_name ? { name: product.file_name, size: product.file_size_bytes } : null
  );
  const [previewImages, setPreviewImages] = useState<string[]>(() => {
    try { const parsed = JSON.parse(product?.preview_images || '[]'); return Array.isArray(parsed) ? parsed : []; }
    catch { return []; }
  });
  const [previewUploading, setPreviewUploading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'name' && !isEditing) {
      setForm((prev) => ({ ...prev, slug: slugify(value as string) }));
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !product) return;
    setFileError(''); setFileSuccess(''); setFileUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { setFileError(data.error || 'Upload failed'); }
      else { setFileSuccess(`Uploaded: ${data.file.name} (${formatBytes(data.file.size)})`); setCurrentFile({ name: data.file.name, size: data.file.size }); setForm((prev) => ({ ...prev, file_url: data.file.url, file_name: data.file.name })); }
    } catch { setFileError('Network error during upload'); }
    finally { setFileUploading(false); e.target.value = ''; }
  }

  async function handlePreviewUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0 || !product) return;
    setPreviewError(''); setPreviewUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append('images', files[i]);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/previews`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { setPreviewError(data.error || 'Upload failed'); }
      else { setPreviewImages(Array.isArray(data.preview_images) ? data.preview_images : []); }
    } catch { setPreviewError('Network error during upload'); }
    finally { setPreviewUploading(false); e.target.value = ''; }
  }

  async function handlePreviewDelete(url: string) {
    if (!product || !confirm('Remove this preview image?')) return;
    try {
      const res = await fetch(`/api/admin/products/${product.id}/previews`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const data = await res.json();
      if (res.ok) setPreviewImages(Array.isArray(data.preview_images) ? data.preview_images : []);
    } catch { /* silently fail */ }
  }

  async function handleStatusChange(newStatus: string) {
    if (!product) return;
    setSaving(true);
    await fetch(`/api/admin/products/${product.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    setForm((prev) => ({ ...prev, status: newStatus }));
    setSaving(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    const url = isEditing ? `/api/admin/products/${product!.id}` : '/api/admin/products';
    const method = isEditing ? 'PATCH' : 'POST';
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, compare_price_cents: form.compare_price_cents || null, file_url: form.file_url || null, file_name: form.file_name || null }),
      });
      if (!res.ok) { const data = await res.json(); setError(data.error || 'Failed to save product'); setSaving(false); return; }
      const data = await res.json();
      if (!isEditing && data.product?.id) { router.push(`/admin/products/${data.product.id}/edit`); }
      else { router.push('/admin/products'); }
    } catch { setError('Network error. Please try again.'); setSaving(false); }
  }

  return (
    <div>
      {isEditing && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-xs text-gray-500 mb-1">Sales</p><p className="text-xl font-bold text-gray-900">{stats.salesCount}</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-xs text-gray-500 mb-1">Revenue</p><p className="text-xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-xs text-gray-500 mb-1">Status</p><span className={`text-sm font-medium px-2 py-1 rounded-full ${form.status === 'active' ? 'bg-green-100 text-green-700' : form.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{form.status}</span></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-xs text-gray-500 mb-1">Downloads</p><p className="text-xl font-bold text-gray-900">{product?.download_count ?? 0}</p></div>
        </div>
      )}

      {isEditing && (
        <div className="flex flex-wrap gap-2 mb-6">
          {form.status !== 'active' && <button onClick={() => handleStatusChange('active')} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">Publish</button>}
          {form.status !== 'draft' && <button onClick={() => handleStatusChange('draft')} disabled={saving} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">Unpublish</button>}
          {form.status !== 'archived' && <button onClick={() => handleStatusChange('archived')} disabled={saving} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">Archive</button>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug</label><input type="text" value={form.slug} onChange={(e) => updateField('slug', e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label><input type="text" value={form.short_description} onChange={(e) => updateField('short_description', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Description (Markdown)</label><textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={8} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm font-mono" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (cents) *</label><input type="number" value={form.price_cents} onChange={(e) => updateField('price_cents', parseInt(e.target.value) || 0)} required min={0} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm" /><p className="text-xs text-gray-500 mt-1">= {formatPrice(form.price_cents)}</p></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Compare Price (cents)</label><input type="number" value={form.compare_price_cents} onChange={(e) => updateField('compare_price_cents', parseInt(e.target.value) || 0)} min={0} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm" />{form.compare_price_cents > 0 && <p className="text-xs text-gray-500 mt-1">= {formatPrice(form.compare_price_cents)}</p>}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={form.category} onChange={(e) => updateField('category', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm">{Object.entries(CATEGORIES).map(([key, cat]) => (<option key={key} value={key}>{cat.label}</option>))}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={form.status} onChange={(e) => updateField('status', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tags (JSON array)</label><input type="text" value={form.tags} onChange={(e) => updateField('tags', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm" /></div>
            <div className="flex items-end"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!form.featured} onChange={(e) => updateField('featured', e.target.checked ? 1 : 0)} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /><span className="text-sm font-medium text-gray-700">Featured Product</span></label></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Media</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
            <input type="url" value={form.thumbnail_url} onChange={(e) => updateField('thumbnail_url', e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm" />
            {form.thumbnail_url && <div className="mt-2"><img src={form.thumbnail_url} alt="Thumbnail preview" className="w-24 h-24 object-cover rounded-lg border border-gray-200" /></div>}
          </div>
        </div>

        {isEditing && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product File</h2>
            {currentFile ? (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
                <span className="text-green-600 text-lg font-bold">OK</span>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-green-800 truncate">{currentFile.name}</p><p className="text-xs text-green-600">{formatBytes(currentFile.size)}</p></div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-4">
                <span className="text-yellow-600 text-lg font-bold">!</span>
                <p className="text-sm text-yellow-800">No file uploaded yet.</p>
              </div>
            )}
            <input type="file" onChange={handleFileUpload} disabled={fileUploading} accept=".pdf,.zip,.xlsx,.csv,.png,.jpg,.jpeg" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50" />
            <p className="text-xs text-gray-500 mt-1">PDF, ZIP, XLSX, CSV, PNG, JPG — max 50MB</p>
            {fileUploading && <p className="text-sm text-indigo-600 mt-2">Uploading...</p>}
            {fileError && <p className="text-sm text-red-600 mt-2">{fileError}</p>}
            {fileSuccess && <p className="text-sm text-green-600 mt-2">{fileSuccess}</p>}
          </div>
        )}

        {isEditing && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview Images</h2>
            {previewImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                {previewImages.map((url, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt={`Preview ${i + 1}`} className="w-full h-24 object-cover" />
                    <button type="button" onClick={() => handlePreviewDelete(url)} className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Remove"><X className="w-3 h-3" aria-hidden="true" /></button>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-500 mb-4">No preview images yet.</p>}
            <input type="file" onChange={handlePreviewUpload} disabled={previewUploading} accept="image/png,image/jpeg,image/webp,image/gif" multiple className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50" />
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP, GIF — max 10MB each</p>
            {previewUploading && <p className="text-sm text-indigo-600 mt-2">Uploading previews...</p>}
            {previewError && <p className="text-sm text-red-600 mt-2">{previewError}</p>}
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3"><p className="text-sm text-red-700">{error}</p></div>}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">{saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}</button>
          <button type="button" onClick={() => router.push('/admin/products')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  );
}
