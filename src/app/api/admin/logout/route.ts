import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  await clearSessionCookie();
  return NextResponse.redirect(new URL('/admin/login', 'http://localhost:3000'), { status: 302 });
}
