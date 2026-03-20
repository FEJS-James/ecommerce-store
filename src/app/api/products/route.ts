import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await queryAll("SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC");
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Public products list error:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}
