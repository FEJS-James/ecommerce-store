import { notFound } from 'next/navigation';
import { queryOne, queryAll } from '@/lib/db';
import { formatPrice, CATEGORIES, CATEGORY_FAQS } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import BuyButton from '@/components/BuyButton';
import PayPalButton from '@/components/PayPalButton';
import CategoryIcon from '@/components/CategoryIcon';
import { Zap, Lock, ShieldCheck, Mail, FileText, HardDrive } from 'lucide-react';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await queryOne<Product>(
    "SELECT * FROM products WHERE slug = ? AND status = 'active'",
    [slug]
  );

  if (!product) {
    notFound();
  }

  const relatedProducts = await queryAll<Product>(
    "SELECT * FROM products WHERE category = ? AND id != ? AND status = 'active' LIMIT 3",
    [product.category, product.id]
  );

  const category = CATEGORIES[product.category];
  const faqs = CATEGORY_FAQS[product.category] || [];

  // Parse preview images safely
  let previewImages: string[] = [];
  try {
    const parsed = JSON.parse(product.preview_images || '[]');
    previewImages = Array.isArray(parsed) ? parsed : [];
  } catch { /* ignore */ }

  // Simple markdown-ish rendering for dark theme
  function renderDescription(text: string) {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let inList = false;

    function flushList() {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 text-zinc-400 mb-4 ml-1">
            {listItems.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    }

    function formatInline(text: string): string {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="bg-white/[0.06] px-1.5 py-0.5 rounded text-sm text-indigo-300 font-mono">$1</code>');
    }

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={elements.length} className="text-3xl font-bold text-white mb-4">
            {trimmed.slice(2)}
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={elements.length} className="text-xl font-semibold text-white mt-8 mb-3">
            {trimmed.slice(3)}
          </h2>
        );
      } else if (trimmed.startsWith('- ')) {
        inList = true;
        listItems.push(trimmed.slice(2));
      } else if (trimmed === '') {
        flushList();
      } else {
        flushList();
        elements.push(
          <p
            key={elements.length}
            className="text-zinc-400 mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
          />
        );
      }
    }
    flushList();

    return elements;
  }

  const hasFileInfo = product.file_name || product.file_size_bytes > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Breadcrumb */}
          <nav className="text-sm text-zinc-500 mb-6" aria-label="Breadcrumb">
            <a href="/products" className="hover:text-indigo-400 transition-colors">Products</a>
            <span className="mx-2 text-zinc-700">/</span>
            {category && (
              <>
                <a href={`/products?category=${product.category}`} className="hover:text-indigo-400 transition-colors">
                  {category.label}
                </a>
                <span className="mx-2 text-zinc-700">/</span>
              </>
            )}
            <span className="text-zinc-300">{product.name}</span>
          </nav>

          {/* Product Image */}
          {product.thumbnail_url && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 glass">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.thumbnail_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Preview Images Gallery */}
          {previewImages.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-white mb-4">Preview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {previewImages.map((url, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden glass">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`${product.name} preview ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="max-w-none">
            {renderDescription(product.description)}
          </div>

          {/* FAQ */}
          {Array.isArray(faqs) && faqs.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="glass rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 sticky top-24">
            {category && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#A5B4FC' }}>
                <CategoryIcon name={category.icon} className="w-3 h-3" aria-hidden="true" />
                {category.label}
              </span>
            )}

            <h1 className="text-2xl font-bold text-white mb-4">{product.name}</h1>

            {product.short_description && (
              <p className="text-zinc-500 text-sm mb-6">{product.short_description}</p>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-white">
                {formatPrice(product.price_cents)}
              </span>
              {product.compare_price_cents && (
                <span className="text-lg text-zinc-600 line-through">
                  {formatPrice(product.compare_price_cents)}
                </span>
              )}
            </div>

            {product.compare_price_cents && (
              <div className="text-sm font-medium px-4 py-2 rounded-lg mb-6 text-center" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#6EE7B7' }}>
                Save {formatPrice(product.compare_price_cents - product.price_cents)} ({Math.round((1 - product.price_cents / product.compare_price_cents) * 100)}% off)
              </div>
            )}

            <BuyButton
              productId={product.id}
              price={formatPrice(product.price_cents)}
              className="mb-4"
            />

            <PayPalButton
              productId={product.id}
              className="mb-6"
            />

            {/* File Info */}
            {hasFileInfo && (
              <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">File Details</h3>
                <div className="space-y-2 text-sm text-zinc-400">
                  {product.file_name && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-zinc-600" aria-hidden="true" />
                      <span className="truncate">{product.file_name}</span>
                    </div>
                  )}
                  {product.file_size_bytes > 0 && (
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-zinc-600" aria-hidden="true" />
                      <span>{formatFileSize(product.file_size_bytes)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3 text-sm text-zinc-500">
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
                <span>Instant download after purchase</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
                <span>Lifetime access with free updates</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
                <span>Email support included</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {Array.isArray(relatedProducts) && relatedProducts.length > 0 && (
        <section className="mt-20 pt-16 border-t border-white/[0.06]">
          <h2 className="text-2xl font-bold text-white mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
