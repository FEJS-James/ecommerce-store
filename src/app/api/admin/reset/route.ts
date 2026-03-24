import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { execute, ensureDb } from '@/lib/db';

const DEFAULT_EMAIL = 'admin@aiarmory.com';
const DEFAULT_PASSWORD = 'AIArmory2026!';
const DEFAULT_NAME = 'Admin';

export async function POST() {
  try {
    // Use env vars if set, otherwise fall back to hardcoded defaults
    const resetEmail = (process.env.ADMIN_RESET_EMAIL || DEFAULT_EMAIL).trim().toLowerCase();
    const resetPassword = process.env.ADMIN_RESET_PASSWORD || DEFAULT_PASSWORD;
    const resetName = DEFAULT_NAME;

    await ensureDb();

    const passwordHash = await bcrypt.hash(resetPassword, 10);

    // Delete ALL existing admin accounts
    await execute('DELETE FROM admin_users', []);

    // Create a fresh admin account
    const id = crypto.randomUUID();
    await execute(
      `INSERT INTO admin_users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`,
      [id, resetEmail, passwordHash, resetName, 'admin']
    );

    return NextResponse.json({
      success: true,
      email: resetEmail,
    });
  } catch (error) {
    console.error('Admin reset error:', error);
    return NextResponse.json(
      { error: 'Reset failed' },
      { status: 500 }
    );
  }
}
