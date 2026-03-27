import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { markdownToBrandedHTML } from '@/lib/pdf-template';
import { htmlToPdf } from '@/lib/pdf-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

    const pdfBuffer = await htmlToPdf(html);

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${product.name.replace(/[^a-zA-Z0-9-_ .]/g, '')}.pdf"`,
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
