import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, setSessionCookie } from '@/lib/auth';
import { ensureDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Ensure DB tables exist (including admin_users)
    await ensureDb();

    const { email, password, rememberMe } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';

    const result = await authenticateAdmin(email, password, ipAddress, rememberMe);

    if (!result.success) {
      const status = result.retryAfter ? 429 : 401;
      return NextResponse.json(
        { error: result.error, ...(result.retryAfter ? { retryAfter: result.retryAfter } : {}) },
        { status }
      );
    }

    await setSessionCookie(result.token, rememberMe);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
