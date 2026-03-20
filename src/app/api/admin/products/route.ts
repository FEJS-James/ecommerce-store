import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const status = request.nextUrl.searchParams.get('status');

    let query = 'SELECT * FROM products';
    const params: string[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const products = db.prepare(query).all(...params);
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products list error:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    const id = uuidv4().replace(/-/g, '');
    const slug = body.slug || slugify(body.name);

    db.prepare(`
      INSERT INTO products (id, name, slug, description, short_description, price_cents, compare_price_cents, category, tags, file_url, file_name, file_size_bytes, preview_images, thumbnail_url, stripe_price_id, status, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      body.name,
      slug,
      body.description || '',
      body.short_description || null,
      body.price_cents || 0,
      body.compare_price_cents || null,
      body.category || 'uncategorized',
      body.tags || '[]',
      body.file_url || null,
      body.file_name || null,
      body.file_size_bytes || 0,
      body.preview_images || '[]',
      body.thumbnail_url || null,
      body.stripe_price_id || null,
      body.status || 'active',
      body.featured ? 1 : 0
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
