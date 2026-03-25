"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ScrollReveal from "@/components/home/ScrollReveal";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";

interface FeaturedProductsSectionProps {
  products: Product[];
}

export default function FeaturedProductsSection({
  products,
}: FeaturedProductsSectionProps) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="py-20 md:py-28 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-zinc-400">
              Our most popular tools, hand-picked for impact
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <ScrollReveal key={product.id} delay={i * 100}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={400}>
          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="text-indigo-400 hover:text-cyan-400 font-medium transition-colors inline-flex items-center gap-1"
            >
              View all products
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
