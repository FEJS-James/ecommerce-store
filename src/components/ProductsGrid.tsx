"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import CategoryIcon from "@/components/CategoryIcon";
import { CATEGORIES } from "@/lib/utils";
import { safeDate } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductsGridProps {
  products: Product[];
  initialCategory: string;
}

export default function ProductsGrid({
  products,
  initialCategory,
}: ProductsGridProps) {
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("featured");

  const filtered = Array.isArray(products)
    ? products.filter((p) => {
        if (category === "all") return true;
        return p.category === category;
      })
    : [];

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "price-low":
        return Number(a.price_cents ?? 0) - Number(b.price_cents ?? 0);
      case "price-high":
        return Number(b.price_cents ?? 0) - Number(a.price_cents ?? 0);
      case "newest":
        return (
          safeDate(b.created_at).getTime() - safeDate(a.created_at).getTime()
        );
      case "featured":
      default:
        return (b.featured ?? 0) - (a.featured ?? 0);
    }
  });

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 flex-1">
          <button
            onClick={() => setCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all focus-glow ${
              category === "all"
                ? "btn-gradient"
                : "glass glass-hover text-zinc-400 hover:text-white"
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 focus-glow ${
                category === key
                  ? "btn-gradient"
                  : "glass glass-hover text-zinc-400 hover:text-white"
              }`}
            >
              <CategoryIcon
                name={cat.iconName}
                className="w-3.5 h-3.5"
                aria-hidden="true"
              />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2 rounded-lg glass-input text-sm focus-glow cursor-pointer"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Products Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg">
            No products found in this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
