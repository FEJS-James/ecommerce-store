import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne, execute, ensureDb } from '@/lib/db';

interface AdminRow {
  id: string;
  email: string;
}

interface AdminCount {
  count: number;
}

export async function POST() {
  try {
    const resetEmail = process.env.ADMIN_RESET_EMAIL;
    const resetPassword = process.env.ADMIN_RESET_PASSWORD;

    // If neither env var is set, the endpoint is dormant
    if (!resetEmail && !resetPassword) {
      return NextResponse.json(
        { error: 'Reset not configured' },
        { status: 503 }
      );
    }

    // Require BOTH to be set
    if (!resetEmail || !resetPassword) {
      return NextResponse.json(
        { error: 'Both ADMIN_RESET_EMAIL and ADMIN_RESET_PASSWORD must be set' },
        { status: 400 }
      );
    }

    // Basic validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      return NextResponse.json(
        { error: 'ADMIN_RESET_EMAIL is not a valid email' },
        { status: 400 }
      );
    }

    if (resetPassword.length < 8) {
      return NextResponse.json(
        { error: 'ADMIN_RESET_PASSWORD must be at least 8 characters' },
        { status: 400 }
      );
    }

    await ensureDb();

    const passwordHash = await bcrypt.hash(resetPassword, 10);

    // Check if any admin exists
    const countResult = await queryOne<AdminCount>(
      'SELECT COUNT(*) as count FROM admin_users',
      []
    );
    const adminExists = countResult && Number(countResult.count) > 0;

    if (adminExists) {
      // Find the first admin and update their credentials
      const admin = await queryOne<AdminRow>(
        'SELECT id, email FROM admin_users ORDER BY created_at ASC LIMIT 1',
        []
      );

      if (!admin) {
        return NextResponse.json(
          { error: 'Failed to find admin user' },
          { status: 500 }
        );
      }

      await execute(
        `UPDATE admin_users SET email = ?, password_hash = ?, updated_at = datetime('now') WHERE id = ?`,
        [resetEmail.trim().toLowerCase(), passwordHash, admin.id]
      );

      return NextResponse.json({
        success: true,
        message: 'Admin credentials updated',
        email: resetEmail.trim().toLowerCase(),
      });
    } else {
      // No admin exists — create one
      const id = crypto.randomUUID();

      await execute(
        `INSERT INTO admin_users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`,
        [id, resetEmail.trim().toLowerCase(), passwordHash, 'Admin', 'admin']
      );

      return NextResponse.json({
        success: true,
        message: 'Admin user created',
        email: resetEmail.trim().toLowerCase(),
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Admin reset error:', error);
    return NextResponse.json(
      { error: 'Reset failed' },
      { status: 500 }
    );
  }
}
