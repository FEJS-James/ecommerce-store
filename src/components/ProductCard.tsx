import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, CATEGORIES } from '@/lib/utils';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const category = CATEGORIES[product.category];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Category badge */}
        {category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
            {category.icon} {category.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {product.name}
        </h3>
        {product.short_description && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {product.short_description}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price_cents)}
          </span>
          {product.compare_price_cents && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compare_price_cents)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
