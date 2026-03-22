import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { queryOne, execute } from '@/lib/db';
import type { Customer } from '@/lib/types';

// ---------------------------------------------------------------------------
// Constants — completely separate namespace from admin auth
// ---------------------------------------------------------------------------
const CUSTOMER_COOKIE = 'customer_token';
const _devFallbackSecret = 'customer-dev-secret-' + crypto.randomUUID();

function getCustomerJwtSecret(): string {
  // Use a different secret or prefix from admin
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  // Prefix to ensure admin and customer tokens are never interchangeable
  return 'customer:' + (secret || _devFallbackSecret);
}

const BCRYPT_ROUNDS = 10;
const TOKEN_EXPIRY = '30d';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CustomerJWTPayload {
  sub: string;       // customer id
  email: string;
  name: string | null;
  type: 'customer';  // discriminator — never confuse with admin
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
export function signCustomerToken(payload: Omit<CustomerJWTPayload, 'iat' | 'exp' | 'type'>): string {
  return jwt.sign({ ...payload, type: 'customer' }, getCustomerJwtSecret(), {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifyCustomerToken(token: string): CustomerJWTPayload | null {
  try {
    const payload = jwt.verify(token, getCustomerJwtSecret()) as CustomerJWTPayload;
    // Double-check the type discriminator
    if (payload.type !== 'customer') return null;
    return payload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------
export async function setCustomerSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

export async function clearCustomerSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE);
}

// ---------------------------------------------------------------------------
// Authentication check
// ---------------------------------------------------------------------------
export async function getAuthenticatedCustomer(): Promise<CustomerJWTPayload | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(CUSTOMER_COOKIE);
  if (!tokenCookie?.value) return null;
  return verifyCustomerToken(tokenCookie.value);
}

export async function isCustomerAuthenticated(): Promise<boolean> {
  return (await getAuthenticatedCustomer()) !== null;
}

// ---------------------------------------------------------------------------
// Customer management
// ---------------------------------------------------------------------------
export async function getCustomerByEmail(email: string): Promise<Customer | undefined> {
  return queryOne<Customer>('SELECT * FROM customers WHERE email = ?', [email.toLowerCase()]);
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  return queryOne<Customer>('SELECT * FROM customers WHERE id = ?', [id]);
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
export async function registerCustomer(
  email: string,
  password: string,
  name?: string
): Promise<{ success: true; customer: Customer; token: string } | { success: false; error: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email already registered with a password
  const existing = await getCustomerByEmail(normalizedEmail);
  if (existing && existing.password_hash) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  const passwordHash = await hashPassword(password);
  const customerName = name?.trim() || null;

  if (existing) {
    // Customer record exists from a purchase but no password — upgrade to full account
    await execute(
      `UPDATE customers SET password_hash = ?, name = COALESCE(?, name), updated_at = datetime('now') WHERE id = ?`,
      [passwordHash, customerName, existing.id]
    );
    const updated = await getCustomerById(existing.id);
    if (!updated) return { success: false, error: 'Failed to update account' };

    const token = signCustomerToken({ sub: updated.id, email: updated.email, name: updated.name });
    return { success: true, customer: updated, token };
  }

  // Create new customer
  const id = crypto.randomUUID().replace(/-/g, '');
  await execute(
    `INSERT INTO customers (id, email, password_hash, name) VALUES (?, ?, ?, ?)`,
    [id, normalizedEmail, passwordHash, customerName]
  );

  const customer = await getCustomerById(id);
  if (!customer) return { success: false, error: 'Failed to create account' };

  const token = signCustomerToken({ sub: customer.id, email: customer.email, name: customer.name });
  return { success: true, customer, token };
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
export async function authenticateCustomer(
  email: string,
  password: string
): Promise<{ success: true; token: string } | { success: false; error: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const customer = await getCustomerByEmail(normalizedEmail);

  if (!customer || !customer.password_hash) {
    return { success: false, error: 'Invalid email or password' };
  }

  const valid = await verifyPassword(password, customer.password_hash);
  if (!valid) {
    return { success: false, error: 'Invalid email or password' };
  }

  const token = signCustomerToken({ sub: customer.id, email: customer.email, name: customer.name });
  return { success: true, token };
}

// ---------------------------------------------------------------------------
// Password reset token generation
// ---------------------------------------------------------------------------
export async function generatePasswordResetToken(email: string): Promise<{ success: boolean; token?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const customer = await getCustomerByEmail(normalizedEmail);

  if (!customer) {
    // Don't reveal whether the email exists
    return { success: true };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  await execute(
    `UPDATE customers SET password_reset_token = ?, password_reset_expires = ?, updated_at = datetime('now') WHERE id = ?`,
    [resetToken, expires, customer.id]
  );

  // TODO: Send email with reset link. For now, return the token for testing.
  return { success: true, token: resetToken };
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const customer = await queryOne<Customer>(
    'SELECT * FROM customers WHERE password_reset_token = ?',
    [token]
  );

  if (!customer) {
    return { success: false, error: 'Invalid or expired reset token' };
  }

  if (customer.password_reset_expires && new Date(customer.password_reset_expires) < new Date()) {
    return { success: false, error: 'Reset token has expired. Please request a new one.' };
  }

  const passwordHash = await hashPassword(newPassword);
  await execute(
    `UPDATE customers SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL, updated_at = datetime('now') WHERE id = ?`,
    [passwordHash, customer.id]
  );

  return { success: true };
}

// ---------------------------------------------------------------------------
// Update profile
// ---------------------------------------------------------------------------
export async function updateCustomerEmail(customerId: string, newEmail: string): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = newEmail.toLowerCase().trim();

  // Check if email is taken by another customer
  const existing = await getCustomerByEmail(normalizedEmail);
  if (existing && existing.id !== customerId) {
    return { success: false, error: 'This email is already in use by another account' };
  }

  await execute(
    `UPDATE customers SET email = ?, updated_at = datetime('now') WHERE id = ?`,
    [normalizedEmail, customerId]
  );
  return { success: true };
}

export async function updateCustomerPassword(
  customerId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const customer = await getCustomerById(customerId);
  if (!customer || !customer.password_hash) {
    return { success: false, error: 'Account not found' };
  }

  const valid = await verifyPassword(currentPassword, customer.password_hash);
  if (!valid) {
    return { success: false, error: 'Current password is incorrect' };
  }

  const passwordHash = await hashPassword(newPassword);
  await execute(
    `UPDATE customers SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`,
    [passwordHash, customerId]
  );
  return { success: true };
}

export async function updateCustomerName(customerId: string, name: string): Promise<void> {
  await execute(
    `UPDATE customers SET name = ?, updated_at = datetime('now') WHERE id = ?`,
    [name.trim(), customerId]
  );
}
