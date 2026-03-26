import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { archiveStripeProduct, reactivateStripeProduct, createStripeProduct } from '@/lib/stripe-sync';
import { repackageProduct } from '@/lib/product-packager';
import { isBlobConfigured } from '@/lib/blob';

export const maxDuration = 60;

const VALID_STATUSES = ['draft', 'active', 'archived'] as const;
type ProductStatus = (typeof VALID_STATUSES)[number];

interface ProductRecord {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  status: string;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  file_url: string | null;
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
    if (newStatus === 'active' && oldStatus !== 'active') {
      if (existing.stripe_product_id) {
        // Reactivate existing Stripe product (e.g. archived → active)
        await reactivateStripeProduct(existing.stripe_product_id);
      } else {
        // Create new Stripe product (e.g. draft → active)
        const stripeResult = await createStripeProduct({
          name: existing.name,
          description: existing.description || undefined,
          price_cents: existing.price_cents,
        });

        if (stripeResult) {
          await execute(
            `UPDATE products SET stripe_product_id = ?, stripe_price_id = ? WHERE id = ?`,
            [stripeResult.stripe_product_id, stripeResult.stripe_price_id, id]
          );
        }
      }
    } else if (newStatus === 'archived' && oldStatus !== 'archived' && existing.stripe_product_id) {
      await archiveStripeProduct(existing.stripe_product_id);
    }

    // Auto-generate branded PDFs when transitioning to active
    let repackageResult = null;
    if (newStatus === 'active' && oldStatus !== 'active' && existing.file_url && isBlobConfigured()) {
      try {
        repackageResult = await repackageProduct(id, existing.name);
        console.log(`[TASK-300] Repackaged product ${id}: ${repackageResult.pdfCount} PDFs generated`);
      } catch (err) {
        // Log but don't fail the status transition — PDFs are best-effort
        console.error(`[TASK-300] PDF repackaging failed for product ${id}:`, err);
      }
    }

    const updated = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
    return NextResponse.json({ product: updated, repackageResult });
  } catch (error) {
    console.error('Update product status error:', error);
    return NextResponse.json({ error: 'Failed to update product status' }, { status: 500 });
  }
}
