import Link from 'next/link';
import { queryAll } from '@/lib/db';
import { CATEGORIES } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import EmailSignup from '@/components/EmailSignup';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const featuredProducts = await queryAll<Product>(
    "SELECT * FROM products WHERE featured = 1 AND status = 'active' LIMIT 4"
  );

  const allProducts = await queryAll<Product>(
    "SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC LIMIT 8"
  );

  return (
    <>
      {/* Hero */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Your Arsenal of{' '}
              <span className="text-indigo-400">AI-Powered Digital Products</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Premium templates, prompt packs, and guides for creators, developers, and professionals.
              No fluff. No filler. Just tools that work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors text-center"
              >
                Browse Products
              </Link>
              <Link
                href="/free"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors text-center backdrop-blur-sm"
              >
                Free Downloads →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">⚡</span>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Instant Delivery</p>
                <p className="text-sm text-gray-500">Download immediately after purchase</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">🔒</span>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Lifetime Access</p>
                <p className="text-sm text-gray-500">Buy once, own forever. Free updates included.</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">✅</span>
              <div className="text-left">
                <p className="font-semibold text-gray-900">30-Day Guarantee</p>
                <p className="text-sm text-gray-500">Not happy? Full refund, no questions asked.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-lg text-gray-500">Our most popular digital products, hand-picked for you</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-500">Find exactly what you need</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <Link
                key={key}
                href={`/products?category=${key}`}
                className="group bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-xl p-6 transition-all"
              >
                <span className="text-4xl block mb-3">{cat.icon}</span>
                <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-gray-500 text-sm">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">All Products</h2>
              <p className="text-lg text-gray-500">Everything we offer</p>
            </div>
            <Link
              href="/products"
              className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Email Signup */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Free Resources</h2>
          <p className="text-gray-300 text-lg mb-8">
            Join our newsletter and get exclusive templates, prompts, and guides delivered to your inbox. Free.
          </p>
          <EmailSignup source="homepage" leadMagnet="newsletter" />
        </div>
      </section>
    </>
  );
}
