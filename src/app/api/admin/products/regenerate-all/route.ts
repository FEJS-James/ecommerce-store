import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { isBlobConfigured } from '@/lib/blob';
import { repackageProduct, type RepackageResult } from '@/lib/product-packager';

export const maxDuration = 300;

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

interface ProductRow {
  id: string;
  name: string;
  file_url: string | null;
}

export async function POST(request: NextRequest) {
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
    // Parse limit from query params (default 10, max 50)
    const limitParam = request.nextUrl.searchParams.get('limit');
    const limit = Math.min(
      Math.max(1, limitParam ? parseInt(limitParam, 10) || DEFAULT_LIMIT : DEFAULT_LIMIT),
      MAX_LIMIT,
    );

    const products = await queryAll<ProductRow>(
      "SELECT id, name, file_url FROM products WHERE status = 'active' AND file_url IS NOT NULL LIMIT ?",
      [limit],
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
        limit,
        hint: `Pass ?limit=N (1–${MAX_LIMIT}) to control batch size. Default: ${DEFAULT_LIMIT}.`,
      },
      results,
    });
  } catch (error) {
    console.error('Bulk PDF regeneration error:', error);
    const message = error instanceof Error ? error.message : 'Bulk regeneration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
