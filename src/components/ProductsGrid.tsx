"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Download,
  Headphones,
  Cloud,
  SlidersHorizontal,
  X,
  ChevronDown,
  Search,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/utils";
import { safeDate } from "@/lib/utils";
import type { Product, ProductType } from "@/lib/types";

interface ProductsGridProps {
  products: Product[];
}

const PRODUCT_TYPES: { key: ProductType; label: string; icon: React.ReactNode }[] = [
  { key: "digital", label: "Digital Products", icon: <Download className="w-4 h-4" aria-hidden="true" /> },
  { key: "service", label: "Services", icon: <Headphones className="w-4 h-4" aria-hidden="true" /> },
  { key: "subscription", label: "Subscriptions", icon: <Cloud className="w-4 h-4" aria-hidden="true" /> },
];

const PRICE_RANGES = [
  { key: "0-20", label: "Under $20", min: 0, max: 2000 },
  { key: "20-40", label: "$20 - $40", min: 2000, max: 4000 },
  { key: "40-100", label: "$40 - $100", min: 4000, max: 10000 },
  { key: "100+", label: "$100+", min: 10000, max: Infinity },
];

const SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "popular", label: "Most Popular" },
];

export default function ProductsGrid({ products }: ProductsGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse initial filter state from URL
  const initialTypes = searchParams.get("type")?.split(",").filter(Boolean) || [];
  const initialCategories = searchParams.get("category")?.split(",").filter(Boolean) || [];
  const initialPrice = searchParams.get("price") || "";
  const initialSort = searchParams.get("sort") || "newest";

  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialTypes);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [selectedPrice, setSelectedPrice] = useState<string>(initialPrice);
  const [sort, setSort] = useState(initialSort);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Close mobile filters on Escape key
  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileFiltersOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileFiltersOpen]);

  // Update URL params
  const updateURL = useCallback(
    (types: string[], categories: string[], price: string, sortVal: string) => {
      const params = new URLSearchParams();
      if (types.length > 0) params.set("type", types.join(","));
      if (categories.length > 0) params.set("category", categories.join(","));
      if (price) params.set("price", price);
      if (sortVal && sortVal !== "newest") params.set("sort", sortVal);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname]
  );

  const toggleType = (type: string) => {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(next);
    updateURL(next, selectedCategories, selectedPrice, sort);
  };

  const toggleCategory = (cat: string) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    setSelectedCategories(next);
    updateURL(selectedTypes, next, selectedPrice, sort);
  };

  const setPrice = (price: string) => {
    const next = selectedPrice === price ? "" : price;
    setSelectedPrice(next);
    updateURL(selectedTypes, selectedCategories, next, sort);
  };

  const setSortOption = (s: string) => {
    setSort(s);
    updateURL(selectedTypes, selectedCategories, selectedPrice, s);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedCategories([]);
    setSelectedPrice("");
    setSort("newest");
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters = selectedTypes.length > 0 || selectedCategories.length > 0 || selectedPrice !== "";

  // Filter and sort products
  const filteredAndSorted = useMemo(() => {
    let result = Array.isArray(products) ? [...products] : [];

    // Filter by product type
    if (selectedTypes.length > 0) {
      result = result.filter((p) => selectedTypes.includes(p.product_type || "digital"));
    }

    // Filter by category
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Filter by price range
    if (selectedPrice) {
      const range = PRICE_RANGES.find((r) => r.key === selectedPrice);
      if (range) {
        result = result.filter((p) => {
          const price = Number(p.price_cents ?? 0);
          return price >= range.min && price < range.max;
        });
      }
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return Number(a.price_cents ?? 0) - Number(b.price_cents ?? 0);
        case "price-desc":
          return Number(b.price_cents ?? 0) - Number(a.price_cents ?? 0);
        case "popular":
          return (b.featured ?? 0) - (a.featured ?? 0);
        case "newest":
        default:
          return safeDate(b.created_at).getTime() - safeDate(a.created_at).getTime();
      }
    });

    return result;
  }, [products, selectedTypes, selectedCategories, selectedPrice, sort]);

  const totalCount = products?.length ?? 0;
  const filteredCount = filteredAndSorted.length;

  // Sidebar filter content (shared between desktop and mobile)
  const filterContent = (
    <div className="space-y-6">
      {/* Product Type */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">
          Product Type
        </h3>
        <div className="space-y-2">
          {PRODUCT_TYPES.map(({ key, label, icon }) => (
            <label
              key={key}
              className="flex items-center gap-3 text-sm cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedTypes.includes(key)}
                onChange={() => toggleType(key)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0 cursor-pointer"
              />
              <span className="flex items-center gap-2 text-zinc-400 group-hover:text-white transition-colors">
                {icon}
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">
          Category
        </h3>
        <div className="space-y-2">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <label
              key={key}
              className="flex items-center gap-3 text-sm cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(key)}
                onChange={() => toggleCategory(key)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-zinc-400 group-hover:text-white transition-colors">
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">
          Price Range
        </h3>
        <div className="flex flex-wrap gap-2">
          {PRICE_RANGES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPrice(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedPrice === key
                  ? "btn-gradient"
                  : "glass glass-hover text-zinc-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 text-sm text-zinc-400 hover:text-white border border-white/10 rounded-lg transition-colors hover:border-white/20"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="flex gap-8">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[250px] flex-shrink-0">
        <div className="glass rounded-2xl p-5 sticky top-24">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Filter Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            role="presentation"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Slide-out panel */}
          <div className="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] glass bg-zinc-900/95 p-6 overflow-y-auto animate-slide-in-left">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar: count + sort + mobile filter button */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 glass glass-hover rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-500 text-white text-xs">
                  {selectedTypes.length + selectedCategories.length + (selectedPrice ? 1 : 0)}
                </span>
              )}
            </button>
            <p className="text-sm text-zinc-500">
              Showing{" "}
              <span className="text-zinc-300 font-medium">{filteredCount}</span>{" "}
              of{" "}
              <span className="text-zinc-300 font-medium">{totalCount}</span>{" "}
              products
            </p>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 rounded-lg glass-input text-sm focus-glow cursor-pointer"
            >
              {SORT_OPTIONS.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Product Grid */}
        {filteredAndSorted.length === 0 ? (
          <div className="glass rounded-2xl text-center py-20 px-6">
            <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" aria-hidden="true" />
            <p className="text-zinc-400 text-lg mb-2">
              No products match your filters.
            </p>
            <p className="text-zinc-600 text-sm mb-6">
              Try adjusting your criteria.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-gradient px-6 py-2 rounded-lg text-sm font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
