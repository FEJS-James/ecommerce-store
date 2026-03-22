import { NextRequest, NextResponse } from 'next/server';
import { generatePasswordResetToken, resetPasswordWithToken } from '@/lib/customer-auth';
import { ensureDb } from '@/lib/db';

// POST /api/account/reset-password — request a reset or complete a reset
export async function POST(request: NextRequest) {
  try {
    await ensureDb();
    const body = await request.json();

    if (body.token && body.newPassword) {
      // Phase 2: Reset password with token
      if (typeof body.newPassword !== 'string' || body.newPassword.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
      }

      const result = await resetPasswordWithToken(body.token, body.newPassword);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Password has been reset. You can now log in.' });
    }

    if (body.email) {
      // Phase 1: Generate reset token
      const result = await generatePasswordResetToken(body.email);
      if (!result.success) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
      }

      // In production, you'd send an email here instead of returning the token
      // For now, return a success message (don't leak whether the email exists)
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
        // TODO: Remove _debug_token in production — only for development/testing
        ...(process.env.NODE_ENV !== 'production' && result.token ? { _debug_token: result.token } : {}),
      });
    }

    return NextResponse.json({ error: 'Provide email (to request reset) or token + newPassword (to complete reset)' }, { status: 400 });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
