import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';

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

    const order = await queryOne<OrderRow>(
      'SELECT id, download_count, max_downloads, token_expires_at, product_id FROM orders WHERE download_token = ?',
      [token]
    );

    if (!order) {
      return NextResponse.json({ error: 'Invalid download token' }, { status: 404 });
    }

    // Check expiry
    if (order.token_expires_at) {
      const expiresAt = new Date(
        order.token_expires_at.endsWith('Z')
          ? order.token_expires_at
          : order.token_expires_at + 'Z'
      );
      if (expiresAt < new Date()) {
        return NextResponse.json({ error: 'Download link has expired' }, { status: 410 });
      }
    }

    // Check download limit
    if (order.download_count >= order.max_downloads) {
      return NextResponse.json({ error: 'Download limit reached' }, { status: 429 });
    }

    // Get product file URL
    const product = await queryOne<ProductRow>(
      'SELECT file_url, file_name, name FROM products WHERE id = ?',
      [order.product_id]
    );

    if (!product || !product.file_url) {
      return NextResponse.json(
        {
          error: 'File not available yet',
          message: 'The download file has not been uploaded yet. You will receive an email when it is ready.',
        },
        { status: 404 }
      );
    }

    // Increment download count on order
    await execute(
      "UPDATE orders SET download_count = download_count + 1, downloaded_at = datetime('now') WHERE id = ?",
      [order.id]
    );

    // Increment product-level download count
    await execute(
      'UPDATE products SET download_count = download_count + 1 WHERE id = ?',
      [order.product_id]
    );

    // Generate a time-limited signed URL if using Vercel Blob, otherwise redirect directly.
    // Vercel Blob public URLs are already accessible, but we proxy the download
    // to avoid exposing the raw blob URL to the customer.
    // We fetch the file and stream it back with appropriate headers.
    try {
      const fileResponse = await fetch(product.file_url);
      if (!fileResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch file from storage' }, { status: 502 });
      }

      const filename = product.file_name || 'download';
      const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';

      return new NextResponse(fileResponse.body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch {
      // Fallback: redirect to file URL (e.g. if proxy fails)
      return NextResponse.redirect(product.file_url);
    }
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
