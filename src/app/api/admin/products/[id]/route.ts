import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    const allowedFields = [
      'name', 'slug', 'description', 'short_description', 'price_cents',
      'compare_price_cents', 'category', 'tags', 'file_url', 'file_name',
      'file_size_bytes', 'preview_images', 'thumbnail_url', 'stripe_price_id',
      'status', 'featured',
    ];

    for (const field of allowedFields) {
      if (field in body) {
        fields.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    fields.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
