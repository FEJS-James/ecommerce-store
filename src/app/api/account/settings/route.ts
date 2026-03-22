import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthenticatedCustomer,
  updateCustomerEmail,
  updateCustomerPassword,
  updateCustomerName,
  signCustomerToken,
  setCustomerSessionCookie,
  getCustomerById,
} from '@/lib/customer-auth';
import { ensureDb } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    await ensureDb();
    const payload = await getAuthenticatedCustomer();
    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'update_email': {
        const { email } = body;
        if (!email) {
          return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }
        const result = await updateCustomerEmail(payload.sub, email);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 409 });
        }
        // Re-issue token with new email
        const customer = await getCustomerById(payload.sub);
        if (customer) {
          const newToken = signCustomerToken({ sub: customer.id, email: customer.email, name: customer.name });
          await setCustomerSessionCookie(newToken);
        }
        return NextResponse.json({ success: true });
      }

      case 'update_password': {
        const { currentPassword, newPassword } = body;
        if (!currentPassword || !newPassword) {
          return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
        }
        if (typeof newPassword !== 'string' || newPassword.length < 8) {
          return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
        }
        const result = await updateCustomerPassword(payload.sub, currentPassword, newPassword);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true });
      }

      case 'update_name': {
        const { name } = body;
        if (!name || typeof name !== 'string' || !name.trim()) {
          return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        await updateCustomerName(payload.sub, name);
        // Re-issue token with new name
        const customer = await getCustomerById(payload.sub);
        if (customer) {
          const newToken = signCustomerToken({ sub: customer.id, email: customer.email, name: customer.name });
          await setCustomerSessionCookie(newToken);
        }
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Invalid action. Use: update_email, update_password, or update_name' }, { status: 400 });
    }
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
