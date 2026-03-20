import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { formatPrice, CATEGORIES, CATEGORY_FAQS } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import BuyButton from '@/components/BuyButton';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const db = getDb();

  const product = db.prepare("SELECT * FROM products WHERE slug = ? AND status = 'active'").get(slug) as Product | undefined;

  if (!product) {
    notFound();
  }

  const relatedProducts = db.prepare(
    "SELECT * FROM products WHERE category = ? AND id != ? AND status = 'active' LIMIT 4"
  ).all(product.category, product.id) as Product[];

  const category = CATEGORIES[product.category];
  const faqs = CATEGORY_FAQS[product.category] || [];

  // Simple markdown-ish rendering
  function renderDescription(text: string) {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let inList = false;

    function flushList() {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 text-gray-600 mb-4">
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
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>');
    }

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={elements.length} className="text-3xl font-bold text-gray-900 mb-4">
            {trimmed.slice(2)}
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={elements.length} className="text-xl font-semibold text-gray-900 mt-6 mb-3">
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
            className="text-gray-600 mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
          />
        );
      }
    }
    flushList();

    return elements;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6">
            <a href="/products" className="hover:text-indigo-600">Products</a>
            <span className="mx-2">›</span>
            {category && (
              <>
                <a href={`/products?category=${product.category}`} className="hover:text-indigo-600">
                  {category.label}
                </a>
                <span className="mx-2">›</span>
              </>
            )}
            <span className="text-gray-900">{product.name}</span>
          </nav>

          {/* Product Image */}
          {product.thumbnail_url && (
            <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.thumbnail_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div className="prose max-w-none">
            {renderDescription(product.description)}
          </div>

          {/* FAQ */}
          {faqs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
            {category && (
              <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
                {category.icon} {category.label}
              </span>
            )}

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {product.short_description && (
              <p className="text-gray-500 text-sm mb-6">{product.short_description}</p>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price_cents)}
              </span>
              {product.compare_price_cents && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.compare_price_cents)}
                </span>
              )}
            </div>

            {product.compare_price_cents && (
              <div className="bg-green-50 text-green-700 text-sm font-medium px-4 py-2 rounded-lg mb-6 text-center">
                Save {formatPrice(product.compare_price_cents - product.price_cents)} ({Math.round((1 - product.price_cents / product.compare_price_cents) * 100)}% off)
              </div>
            )}

            <BuyButton
              productId={product.id}
              price={formatPrice(product.price_cents)}
              className="mb-6"
            />

            <div className="space-y-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>Instant download after purchase</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>Lifetime access with free updates</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>Email support included</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
