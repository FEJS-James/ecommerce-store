import { queryAll } from '@/lib/db';
import ProductsGrid from '@/components/ProductsGrid';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'All Products | Digital Products Store',
  description: 'Browse our collection of premium digital products for creators and professionals.',
};

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const initialCategory = params.category || 'all';

  const products = await queryAll<Product>(
    "SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">All Products</h1>
        <p className="text-lg text-gray-500">Premium digital products for creators and professionals</p>
      </div>

      <ProductsGrid products={products} initialCategory={initialCategory} />
    </div>
  );
}
