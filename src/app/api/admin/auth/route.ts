import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, generateSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!validatePassword(password)) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = generateSessionToken();
    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
