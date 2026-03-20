import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { email, name, source, lead_magnet } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await queryOne<{ id: string; unsubscribed_at: string | null }>(
      'SELECT id, unsubscribed_at FROM email_subscribers WHERE email = ?',
      [email]
    );

    if (existing) {
      if (existing.unsubscribed_at) {
        // Re-subscribe
        await execute(
          "UPDATE email_subscribers SET unsubscribed_at = NULL, subscribed_at = datetime('now'), source = ?, lead_magnet = COALESCE(?, lead_magnet) WHERE id = ?",
          [source || 'website', lead_magnet || null, existing.id]
        );
        return NextResponse.json({ message: 'Welcome back! You\'ve been re-subscribed.' });
      }
      return NextResponse.json({ message: 'You\'re already subscribed! Check your email for the latest resources.' });
    }

    await execute(
      'INSERT INTO email_subscribers (id, email, name, source, lead_magnet) VALUES (?, ?, ?, ?, ?)',
      [uuidv4().replace(/-/g, ''), email, name || null, source || 'website', lead_magnet || null]
    );

    return NextResponse.json({ message: 'You\'re in! Check your email for your free resources.' });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
