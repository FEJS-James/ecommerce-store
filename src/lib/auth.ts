import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { queryOne, queryAll, execute } from '@/lib/db';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SESSION_COOKIE = 'admin_token';
const _devFallbackSecret = 'dev-only-secret-' + crypto.randomUUID();

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  return secret || _devFallbackSecret;
}

const BCRYPT_ROUNDS = 10;

const TOKEN_EXPIRY_DEFAULT = '24h';
const TOKEN_EXPIRY_REMEMBER = '30d';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface JWTPayload {
  sub: string;       // admin user id
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ---------------------------------------------------------------------------
// Password helpers
// ---------------------------------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------
export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, rememberMe = false): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: rememberMe ? TOKEN_EXPIRY_REMEMBER : TOKEN_EXPIRY_DEFAULT,
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------
export async function setSessionCookie(token: string, rememberMe = false) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30 days or 24 hours
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ---------------------------------------------------------------------------
// Authentication check
// ---------------------------------------------------------------------------
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(SESSION_COOKIE);
  if (!tokenCookie?.value) return false;
  const payload = verifyToken(tokenCookie.value);
  return payload !== null;
}

export async function getAuthUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(SESSION_COOKIE);
  if (!tokenCookie?.value) return null;
  return verifyToken(tokenCookie.value);
}

// ---------------------------------------------------------------------------
// Lockout logic
// ---------------------------------------------------------------------------
export async function isLockedOut(email: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000).toISOString();
  const result = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM login_attempts
     WHERE email = ? AND success = 0 AND attempted_at > ?`,
    [email, cutoff]
  );
  return (result?.count ?? 0) >= MAX_LOGIN_ATTEMPTS;
}

export async function recordLoginAttempt(email: string, ipAddress: string, success: boolean) {
  const id = crypto.randomUUID();
  await execute(
    `INSERT INTO login_attempts (id, email, ip_address, success, attempted_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [id, email, ipAddress, success ? 1 : 0]
  );

  // On successful login, clear old failed attempts for this email
  if (success) {
    await execute(
      `DELETE FROM login_attempts WHERE email = ? AND success = 0`,
      [email]
    );
  }
}

export async function getRemainingLockoutSeconds(email: string): Promise<number> {
  const cutoff = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000).toISOString();
  const lastAttempt = await queryOne<{ attempted_at: string }>(
    `SELECT attempted_at FROM login_attempts
     WHERE email = ? AND success = 0 AND attempted_at > ?
     ORDER BY attempted_at DESC LIMIT 1`,
    [email, cutoff]
  );
  if (!lastAttempt) return 0;
  const attemptTime = new Date(
    lastAttempt.attempted_at.endsWith('Z')
      ? lastAttempt.attempted_at
      : lastAttempt.attempted_at + 'Z'
  ).getTime();
  const lockoutEnd = attemptTime + LOCKOUT_MINUTES * 60 * 1000;
  return Math.max(0, Math.ceil((lockoutEnd - Date.now()) / 1000));
}

// ---------------------------------------------------------------------------
// Admin user management
// ---------------------------------------------------------------------------
export async function getAdminByEmail(email: string): Promise<AdminUser | undefined> {
  return queryOne<AdminUser>('SELECT * FROM admin_users WHERE email = ?', [email]);
}

export async function getAdminById(id: string): Promise<AdminUser | undefined> {
  return queryOne<AdminUser>('SELECT * FROM admin_users WHERE id = ?', [id]);
}

export async function updateAdminPassword(id: string, newPasswordHash: string): Promise<void> {
  await execute(
    `UPDATE admin_users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`,
    [newPasswordHash, id]
  );
}

// ---------------------------------------------------------------------------
// Login flow
// ---------------------------------------------------------------------------
export async function authenticateAdmin(
  email: string,
  password: string,
  ipAddress: string,
  rememberMe = false
): Promise<{ success: true; token: string } | { success: false; error: string; retryAfter?: number }> {
  // Check lockout
  if (await isLockedOut(email)) {
    const retryAfter = await getRemainingLockoutSeconds(email);
    return {
      success: false,
      error: `Too many failed attempts. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
      retryAfter,
    };
  }

  // Find user
  const user = await getAdminByEmail(email);
  if (!user) {
    await recordLoginAttempt(email, ipAddress, false);
    return { success: false, error: 'Invalid email or password' };
  }

  // Verify password
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    await recordLoginAttempt(email, ipAddress, false);

    // Check if now locked out
    if (await isLockedOut(email)) {
      return {
        success: false,
        error: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`,
        retryAfter: LOCKOUT_MINUTES * 60,
      };
    }

    return { success: false, error: 'Invalid email or password' };
  }

  // Success
  await recordLoginAttempt(email, ipAddress, true);
  const token = signToken(
    { sub: user.id, email: user.email, name: user.name, role: user.role },
    rememberMe
  );

  return { success: true, token };
}
