import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll } from '@/lib/db';
import type { Product } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await queryOne<Product>(
      "SELECT * FROM products WHERE slug = ? AND status = 'active'",
      [slug]
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const relatedProducts = await queryAll(
      "SELECT * FROM products WHERE category = ? AND id != ? AND status = 'active' LIMIT 4",
      [product.category, product.id]
    );

    return NextResponse.json({ product, relatedProducts });
  } catch (error) {
    console.error('Public product detail error:', error);
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 });
  }
}
