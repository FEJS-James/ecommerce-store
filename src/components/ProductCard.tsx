import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/utils";
import CategoryIcon from "@/components/CategoryIcon";
import GeoPrice from "@/components/GeoPrice";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const category = CATEGORIES[product.category];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group glass card-glow block overflow-hidden focus-glow rounded-2xl"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[3/2] overflow-hidden bg-white/[0.02]">
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <svg
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {/* Category badge */}
        {category && (
          <span className="absolute top-3 left-3 glass flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full text-zinc-200">
            <CategoryIcon
              name={category.iconName}
              className="w-3 h-3"
              aria-hidden="true"
            />
            {category.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
          {product.name}
        </h3>
        {product.short_description && (
          <p className="text-zinc-500 text-sm mb-4 line-clamp-2">
            {product.short_description}
          </p>
        )}
        <div className="flex items-center gap-2">
          <GeoPrice
            priceCents={product.price_cents}
            comparePriceCents={product.compare_price_cents}
            className="text-lg font-bold text-white"
            strikethroughClassName="text-sm text-zinc-600 line-through"
          />
        </div>
      </div>
    </Link>
  );
}
