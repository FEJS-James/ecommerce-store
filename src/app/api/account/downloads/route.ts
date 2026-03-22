import { NextResponse } from 'next/server';
import { getAuthenticatedCustomer } from '@/lib/customer-auth';
import { queryAll, ensureDb } from '@/lib/db';

interface DownloadableProduct {
  order_id: string;
  download_token: string;
  download_count: number;
  max_downloads: number;
  token_expires_at: string | null;
  order_created_at: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_thumbnail_url: string | null;
  file_url: string | null;
}

export async function GET() {
  try {
    await ensureDb();
    const payload = await getAuthenticatedCustomer();
    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const downloads = await queryAll<DownloadableProduct>(
      `SELECT o.id as order_id, o.download_token, o.download_count, o.max_downloads,
              o.token_expires_at, o.created_at as order_created_at,
              p.id as product_id, p.name as product_name, p.slug as product_slug,
              p.thumbnail_url as product_thumbnail_url, p.file_url
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE (o.customer_id = ? OR o.customer_email = ?)
         AND o.status = 'completed'
         AND o.download_token IS NOT NULL
       ORDER BY o.created_at DESC`,
      [payload.sub, payload.email]
    );

    return NextResponse.json({ downloads });
  } catch (error) {
    console.error('Downloads error:', error);
    return NextResponse.json({ error: 'Failed to fetch downloads' }, { status: 500 });
  }
}
