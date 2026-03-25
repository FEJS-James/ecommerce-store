import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existing = await queryOne<{ id: string; name: string; status: string }>(
      'SELECT id, name, status FROM products WHERE id = ?',
      [id]
    );
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (existing.status !== 'archived') {
      return NextResponse.json({ error: 'Only archived products can be permanently deleted' }, { status: 400 });
    }

    // Hard delete: permanently remove from database
    await execute('DELETE FROM products WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Hard delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to permanently delete product' },
      { status: 500 }
    );
  }
}
