import { NextRequest, NextResponse } from 'next/server';
import { authenticateCustomer, setCustomerSessionCookie } from '@/lib/customer-auth';
import { ensureDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await ensureDb();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    const result = await authenticateCustomer(email, password, ipAddress);

    if (!result.success) {
      // Return 429 if rate limited, 401 otherwise
      if ('retryAfter' in result && result.retryAfter) {
        return NextResponse.json(
          { error: result.error, retryAfter: result.retryAfter },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    await setCustomerSessionCookie(result.token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
