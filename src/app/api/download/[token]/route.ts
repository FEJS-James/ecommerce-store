import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

interface OrderRow {
  id: string;
  download_count: number;
  max_downloads: number;
  token_expires_at: string | null;
  product_id: string;
}

interface ProductRow {
  file_url: string | null;
  file_name: string | null;
  name: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const db = getDb();

    const order = db.prepare(
      'SELECT id, download_count, max_downloads, token_expires_at, product_id FROM orders WHERE download_token = ?'
    ).get(token) as OrderRow | undefined;

    if (!order) {
      return NextResponse.json({ error: 'Invalid download token' }, { status: 404 });
    }

    // Check expiry
    if (order.token_expires_at && new Date(order.token_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Download link has expired' }, { status: 410 });
    }

    // Check download limit
    if (order.download_count >= order.max_downloads) {
      return NextResponse.json({ error: 'Download limit reached' }, { status: 429 });
    }

    // Get product file URL
    const product = db.prepare('SELECT file_url, file_name, name FROM products WHERE id = ?').get(order.product_id) as ProductRow | undefined;

    if (!product || !product.file_url) {
      return NextResponse.json(
        {
          error: 'File not available yet',
          message: 'The download file has not been uploaded yet. You will receive an email when it is ready.',
        },
        { status: 404 }
      );
    }

    // Increment download count
    db.prepare(
      "UPDATE orders SET download_count = download_count + 1, downloaded_at = datetime('now') WHERE id = ?"
    ).run(order.id);

    // Redirect to file URL
    return NextResponse.redirect(product.file_url);
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
