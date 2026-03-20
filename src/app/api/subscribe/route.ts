import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { email, name, source, lead_magnet } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const db = getDb();

    // Check if already subscribed
    const existing = db.prepare('SELECT id, unsubscribed_at FROM email_subscribers WHERE email = ?').get(email) as { id: string; unsubscribed_at: string | null } | undefined;

    if (existing) {
      if (existing.unsubscribed_at) {
        // Re-subscribe
        db.prepare(
          "UPDATE email_subscribers SET unsubscribed_at = NULL, subscribed_at = datetime('now'), source = ?, lead_magnet = COALESCE(?, lead_magnet) WHERE id = ?"
        ).run(source || 'website', lead_magnet || null, existing.id);
        return NextResponse.json({ message: 'Welcome back! You\'ve been re-subscribed.' });
      }
      return NextResponse.json({ message: 'You\'re already subscribed! Check your email for the latest resources.' });
    }

    db.prepare(
      'INSERT INTO email_subscribers (id, email, name, source, lead_magnet) VALUES (?, ?, ?, ?, ?)'
    ).run(uuidv4().replace(/-/g, ''), email, name || null, source || 'website', lead_magnet || null);

    return NextResponse.json({ message: 'You\'re in! Check your email for your free resources.' });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
