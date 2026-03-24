import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { queryOne, execute, ensureDb } from '@/lib/db';

interface AdminCount {
  count: number;
}

interface CreatedAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    await ensureDb();

    // Parse and validate request body
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'A valid email is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const adminName = (name && typeof name === 'string') ? name.trim().slice(0, 100) : 'Admin';

    // Hash the password using the same bcrypt config as the auth system
    const passwordHash = await hashPassword(password);
    const id = crypto.randomUUID();

    // Atomic insert: only succeeds if no admin exists yet (prevents TOCTOU race condition)
    const result = await execute(
      `INSERT INTO admin_users (id, email, password_hash, name, role)
       SELECT ?, ?, ?, ?, ?
       WHERE NOT EXISTS (SELECT 1 FROM admin_users)`,
      [id, email.trim().toLowerCase(), passwordHash, adminName, 'admin']
    );

    // If rowsAffected is 0, an admin already exists — endpoint is sealed
    if (Number(result.rowsAffected) === 0) {
      return NextResponse.json(
        { error: 'Setup already completed' },
        { status: 403 }
      );
    }

    // Fetch the created admin to return (without password_hash)
    const created = await queryOne<CreatedAdmin>(
      'SELECT id, email, name, role, created_at FROM admin_users WHERE id = ?',
      [id]
    );

    return NextResponse.json({
      success: true,
      admin: created,
    }, { status: 201 });
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: 'Setup failed' },
      { status: 500 }
    );
  }
}

// GET: check if setup is needed (useful for UI to show setup vs login)
export async function GET() {
  try {
    await ensureDb();

    const result = await queryOne<AdminCount>(
      'SELECT COUNT(*) as count FROM admin_users',
      []
    );

    const setupRequired = !result || Number(result.count) === 0;

    return NextResponse.json({
      setupRequired,
    });
  } catch (error) {
    console.error('Admin setup check error:', error);
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 }
    );
  }
}
