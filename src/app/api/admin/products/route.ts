import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne, execute } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { isAuthenticated } from '@/lib/auth';
import { createStripeProduct } from '@/lib/stripe-sync';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const status = request.nextUrl.searchParams.get('status');
    const category = request.nextUrl.searchParams.get('category');
    const search = request.nextUrl.searchParams.get('search');

    let query = 'SELECT * FROM products';
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const products = await queryAll(query, params);
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products list error:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const id = uuidv4().replace(/-/g, '');
    const slug = body.slug || slugify(body.name);

    await execute(
      `INSERT INTO products (id, name, slug, description, short_description, price_cents, compare_price_cents, category, tags, file_url, file_name, file_size_bytes, preview_images, thumbnail_url, stripe_price_id, status, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
        body.featured ? 1 : 0,
      ]
    );

    // Sync to Stripe only for active products (drafts sync later when activated)
    const productStatus = body.status || 'active';
    if (productStatus === 'active') {
      const stripeResult = await createStripeProduct({
        name: body.name,
        description: body.description || undefined,
        price_cents: body.price_cents || 0,
      });

      if (stripeResult) {
        await execute(
          `UPDATE products SET stripe_product_id = ?, stripe_price_id = ? WHERE id = ?`,
          [stripeResult.stripe_product_id, stripeResult.stripe_price_id, id]
        );
      }
    }

    const product = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
