import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE = 'admin_session';
const SESSION_SECRET = process.env.ADMIN_PASSWORD || 'default-dev-password';

export function generateSessionToken(): string {
  const token = crypto.createHash('sha256').update(SESSION_SECRET + Date.now()).digest('hex');
  return token;
}

export function validatePassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  return password === adminPassword;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return !!session?.value;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
