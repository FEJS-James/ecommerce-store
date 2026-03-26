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

    // Validate name (required, non-empty string)
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    // Validate description length (reject over 50,000 chars to prevent abuse, never silently truncate)
    if (body.description !== undefined && body.description !== null) {
      if (typeof body.description !== 'string') {
        return NextResponse.json({ error: 'Description must be a string' }, { status: 400 });
      }
      if (body.description.length > 50000) {
        return NextResponse.json(
          { error: `Description too long (${body.description.length} chars). Maximum is 50,000 characters.` },
          { status: 400 }
        );
      }
    }

    // Validate short_description length
    if (body.short_description !== undefined && body.short_description !== null) {
      if (typeof body.short_description !== 'string') {
        return NextResponse.json({ error: 'Short description must be a string' }, { status: 400 });
      }
      if (body.short_description.length > 500) {
        return NextResponse.json(
          { error: `Short description too long (${body.short_description.length} chars). Maximum is 500 characters.` },
          { status: 400 }
        );
      }
    }

    // Validate price_cents (non-negative integer, if provided)
    if (body.price_cents !== undefined) {
      if (typeof body.price_cents !== 'number' || body.price_cents < 0 || !Number.isInteger(body.price_cents)) {
        return NextResponse.json({ error: 'Price must be a non-negative integer' }, { status: 400 });
      }
    }

    // Validate category (non-empty string, if provided)
    if (body.category !== undefined && body.category !== null) {
      if (typeof body.category !== 'string' || body.category.trim().length === 0) {
        return NextResponse.json({ error: 'Category must be a non-empty string' }, { status: 400 });
      }
    }

    // Validate tags (valid JSON string, if provided)
    if (body.tags !== undefined && body.tags !== null) {
      if (typeof body.tags !== 'string') {
        return NextResponse.json({ error: 'Tags must be a valid JSON string' }, { status: 400 });
      }
      try {
        JSON.parse(body.tags);
      } catch {
        return NextResponse.json({ error: 'Tags must be a valid JSON string' }, { status: 400 });
      }
    }

    const id = uuidv4().replace(/-/g, '');
    const slug = body.slug || slugify(body.name);

    // Check slug uniqueness
    const existing = await queryOne('SELECT id FROM products WHERE slug = ?', [slug]);
    if (existing) {
      return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 });
    }

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
