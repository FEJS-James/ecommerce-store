import { NextRequest, NextResponse } from 'next/server';
import { registerCustomer, setCustomerSessionCookie } from '@/lib/customer-auth';
import { ensureDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await ensureDb();
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const result = await registerCustomer(email, password, name);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    await setCustomerSessionCookie(result.token);

    return NextResponse.json({
      success: true,
      customer: {
        id: result.customer.id,
        email: result.customer.email,
        name: result.customer.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
