import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const customers = await queryAll('SELECT * FROM customers ORDER BY last_purchase_at DESC');
    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Customers error:', error);
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 });
  }
}
