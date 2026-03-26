import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { isBlobConfigured } from '@/lib/blob';
import { repackageProduct } from '@/lib/product-packager';

export const maxDuration = 60;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const { id } = await params;

    const product = await queryOne<{ id: string; name: string; file_url: string | null }>(
      'SELECT id, name, file_url FROM products WHERE id = ?',
      [id],
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!product.file_url) {
      return NextResponse.json(
        { error: 'Product has no uploaded file to repackage' },
        { status: 400 },
      );
    }

    const result = await repackageProduct(id, product.name);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('PDF regeneration error:', error);
    const message = error instanceof Error ? error.message : 'Regeneration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
