import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const customers = db.prepare('SELECT * FROM customers ORDER BY last_purchase_at DESC').all();
    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Customers error:', error);
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 });
  }
}
