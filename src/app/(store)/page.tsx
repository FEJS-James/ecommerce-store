import Link from 'next/link';
import { queryAll } from '@/lib/db';
import { CATEGORIES } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import EmailSignup from '@/components/EmailSignup';
import CategoryIcon from '@/components/CategoryIcon';
import { Zap, Lock, ShieldCheck } from 'lucide-react';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const featuredProducts = await queryAll<Product>(
    "SELECT * FROM products WHERE featured = 1 AND status = 'active' LIMIT 6"
  );

  const allProducts = await queryAll<Product>(
    "SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC LIMIT 6"
  );

  return (
    <>
      {/* Hero Section */}
      <section className="gradient-mesh relative" style={{ background: '#0A0A0F' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              Your Arsenal of{' '}
              <span className="gradient-text">AI-Powered</span>{' '}
              Digital Products
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl">
              Premium templates, prompt packs, and guides for creators, developers, and professionals.
              No fluff. No filler. Just tools that work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="btn-gradient px-8 py-4 rounded-xl font-semibold text-lg text-center focus-glow"
              >
                Browse Products
              </Link>
              <Link
                href="/free"
                className="btn-ghost px-8 py-4 rounded-xl font-semibold text-lg text-center focus-glow"
              >
                Free Downloads
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-white/[0.06]" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                <Zap className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Instant Delivery</p>
                <p className="text-xs text-zinc-500">Download immediately after purchase</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                <Lock className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Lifetime Access</p>
                <p className="text-xs text-zinc-500">Buy once, own forever. Free updates included.</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                <ShieldCheck className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">30-Day Guarantee</p>
                <p className="text-xs text-zinc-500">Not happy? Full refund, no questions asked.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {Array.isArray(featuredProducts) && featuredProducts.length > 0 && (
        <section className="py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Featured Products</h2>
              <p className="text-lg text-zinc-500">Our most popular digital products, hand-picked for you</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse by Category */}
      <section className="py-20 md:py-24 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Browse by Category</h2>
            <p className="text-lg text-zinc-500">Find exactly what you need</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <Link
                key={key}
                href={`/products?category=${key}`}
                className="group glass card-glow p-6 rounded-2xl focus-glow"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                  <CategoryIcon name={cat.iconName} className="w-6 h-6 text-indigo-400 group-hover:text-cyan-400 transition-colors" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-indigo-300 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-zinc-500 text-sm">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Products */}
      {Array.isArray(allProducts) && allProducts.length > 0 && (
        <section className="py-20 md:py-24 border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-14">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">All Products</h2>
                <p className="text-lg text-zinc-500">Everything we offer</p>
              </div>
              <Link
                href="/products"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hidden sm:inline-block"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/products"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                View all products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-20 md:py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))' }}>
        <div className="absolute inset-0 border-t border-white/[0.06]" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get Free Resources</h2>
          <p className="text-zinc-400 text-lg mb-10">
            Join our newsletter and get exclusive templates, prompts, and guides delivered to your inbox. Free.
          </p>
          <EmailSignup source="homepage" leadMagnet="newsletter" />
        </div>
      </section>
    </>
  );
}
