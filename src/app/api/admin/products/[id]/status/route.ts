import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { archiveStripeProduct, reactivateStripeProduct } from '@/lib/stripe-sync';

const VALID_STATUSES = ['draft', 'active', 'archived'] as const;
type ProductStatus = (typeof VALID_STATUSES)[number];

interface ProductRecord {
  id: string;
  status: string;
  stripe_product_id: string | null;
  [key: string]: unknown;
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
    const newStatus = body.status as ProductStatus;

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const existing = await queryOne<ProductRecord>('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const oldStatus = existing.status;

    // Update status in DB
    await execute(
      `UPDATE products SET status = ?, updated_at = datetime('now') WHERE id = ?`,
      [newStatus, id]
    );

    // Stripe sync based on status transition
    if (existing.stripe_product_id) {
      if (newStatus === 'archived' && oldStatus !== 'archived') {
        await archiveStripeProduct(existing.stripe_product_id);
      } else if (newStatus === 'active' && oldStatus === 'archived') {
        await reactivateStripeProduct(existing.stripe_product_id);
      }
    }

    const updated = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error('Update product status error:', error);
    return NextResponse.json({ error: 'Failed to update product status' }, { status: 500 });
  }
}
