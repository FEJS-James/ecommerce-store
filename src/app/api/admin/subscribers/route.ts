import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Subscriber {
  email: string;
  name: string | null;
  source: string;
  lead_magnet: string | null;
  subscribed_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const format = request.nextUrl.searchParams.get('format');

    const subscribers = db.prepare(
      'SELECT * FROM email_subscribers WHERE unsubscribed_at IS NULL ORDER BY subscribed_at DESC'
    ).all() as Subscriber[];

    if (format === 'csv') {
      const headers = ['email', 'name', 'source', 'lead_magnet', 'subscribed_at'];
      const csvRows = [headers.join(',')];

      for (const sub of subscribers) {
        const row = [
          `"${sub.email}"`,
          `"${sub.name || ''}"`,
          `"${sub.source}"`,
          `"${sub.lead_magnet || ''}"`,
          `"${sub.subscribed_at}"`,
        ];
        csvRows.push(row.join(','));
      }

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=subscribers.csv',
        },
      });
    }

    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error('Subscribers error:', error);
    return NextResponse.json({ error: 'Failed to load subscribers' }, { status: 500 });
  }
}
