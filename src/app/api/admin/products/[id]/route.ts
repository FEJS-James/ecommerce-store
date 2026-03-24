import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll, execute } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import {
  updateStripeProduct,
  updateStripePrice,
  archiveStripeProduct,
} from '@/lib/stripe-sync';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const product = await queryOne('SELECT * FROM products WHERE id = ?', [id]);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const stats = await queryOne<{ sales_count: number; total_revenue: number }>(`
      SELECT COUNT(*) as sales_count, COALESCE(SUM(amount_cents), 0) as total_revenue
      FROM orders WHERE product_id = ? AND status = 'completed'
    `, [id]);

    return NextResponse.json({
      product,
      stats: {
        salesCount: stats?.sales_count ?? 0,
        totalRevenue: stats?.total_revenue ?? 0,
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 });
  }
}

const ALLOWED_FIELDS = [
  'name', 'slug', 'description', 'short_description', 'price_cents',
  'compare_price_cents', 'category', 'tags', 'file_url', 'file_name',
  'file_size_bytes', 'preview_images', 'thumbnail_url', 'stripe_price_id',
  'status', 'featured',
];

interface ProductRecord {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  status: string;
  [key: string]: unknown;
}

async function updateProductHandler(id: string, body: Record<string, unknown>) {
  const existing = await queryOne<ProductRecord>('SELECT * FROM products WHERE id = ?', [id]);
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  for (const field of ALLOWED_FIELDS) {
    if (field in body) {
      fields.push(`${field} = ?`);
      values.push(body[field] as string | number | null);
    }
  }

  if (fields.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  fields.push("updated_at = datetime('now')");
  values.push(id);

  await execute(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);

  // Stripe sync: update name/description if changed
  if (existing.stripe_product_id) {
    const stripeUpdates: { name?: string; description?: string } = {};
    if ('name' in body && body.name !== existing.name) {
      stripeUpdates.name = body.name as string;
    }
    if ('description' in body && body.description !== existing.description) {
      stripeUpdates.description = body.description as string;
    }
    if (Object.keys(stripeUpdates).length > 0) {
      await updateStripeProduct(existing.stripe_product_id, stripeUpdates);
    }

    // Stripe sync: update price if changed (create new price, archive old)
    if ('price_cents' in body && body.price_cents !== existing.price_cents) {
      const newPriceId = await updateStripePrice(
        existing.stripe_product_id,
        existing.stripe_price_id,
        body.price_cents as number
      );
      if (newPriceId) {
        await execute(
          `UPDATE products SET stripe_price_id = ? WHERE id = ?`,
          [newPriceId, id]
        );
      }
    }
  }

  const updated = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
  return NextResponse.json({ product: updated });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    return updateProductHandler(id, body);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    return updateProductHandler(id, body);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existing = await queryOne<ProductRecord>('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Soft delete: set status to archived instead of hard delete
    await execute(
      `UPDATE products SET status = 'archived', updated_at = datetime('now') WHERE id = ?`,
      [id]
    );

    // Archive in Stripe if synced
    if (existing.stripe_product_id) {
      await archiveStripeProduct(existing.stripe_product_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
