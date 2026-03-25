import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { markdownToBrandedHTML } from '@/lib/pdf-template';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const product = await queryOne<{
      id: string;
      name: string;
      description: string | null;
    }>('SELECT id, name, description FROM products WHERE id = ?', [id]);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      );
    }

    const html = markdownToBrandedHTML(product.description || '', {
      title: product.name,
      variant: 'guide',
    });

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('PDF template generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF template' },
      { status: 500 },
    );
  }
}
