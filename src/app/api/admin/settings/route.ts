import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { isStripeConfigured } from '@/lib/stripe';
import { isBlobConfigured } from '@/lib/blob';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    stripeConfigured: isStripeConfigured(),
    blobConfigured: isBlobConfigured(),
    databaseUrl: process.env.TURSO_DATABASE_URL ? 'configured' : 'not configured',
  });
}
