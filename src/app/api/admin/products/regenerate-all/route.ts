import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { isBlobConfigured } from '@/lib/blob';
import { repackageProduct, type RepackageResult } from '@/lib/product-packager';

export const maxDuration = 300;

interface ProductRow {
  id: string;
  name: string;
  file_url: string | null;
}

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isBlobConfigured()) {
    return NextResponse.json(
      { error: 'Blob storage not configured' },
      { status: 503 },
    );
  }

  try {
    const products = await queryAll<ProductRow>(
      "SELECT id, name, file_url FROM products WHERE status = 'active' AND file_url IS NOT NULL",
    );

    const results: {
      productId: string;
      productName: string;
      success: boolean;
      result?: RepackageResult;
      error?: string;
    }[] = [];

    for (const product of products) {
      try {
        const result = await repackageProduct(product.id, product.name);
        results.push({
          productId: product.id,
          productName: product.name,
          success: true,
          result,
        });
      } catch (err) {
        results.push({
          productId: product.id,
          productName: product.name,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      summary: {
        total: products.length,
        succeeded,
        failed,
      },
      results,
    });
  } catch (error) {
    console.error('Bulk PDF regeneration error:', error);
    const message = error instanceof Error ? error.message : 'Bulk regeneration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
