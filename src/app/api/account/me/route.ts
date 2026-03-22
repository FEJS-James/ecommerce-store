import { NextResponse } from 'next/server';
import { getAuthenticatedCustomer, getCustomerById } from '@/lib/customer-auth';
import { ensureDb } from '@/lib/db';

export async function GET() {
  try {
    await ensureDb();
    const payload = await getAuthenticatedCustomer();
    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const customer = await getCustomerById(payload.sub);
    if (!customer) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      total_spent_cents: customer.total_spent_cents,
      order_count: customer.order_count,
      created_at: customer.created_at,
    });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ error: 'Failed to get account info' }, { status: 500 });
  }
}
