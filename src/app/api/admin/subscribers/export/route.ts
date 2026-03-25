import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import type { EmailSubscriber } from '@/lib/types';

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const source = typeof body.source === 'string' ? body.source : null;
    const status = typeof body.status === 'string' ? body.status : null;
    const startDate =
      typeof body.start_date === 'string' ? body.start_date : null;
    const endDate = typeof body.end_date === 'string' ? body.end_date : null;

    let where = 'WHERE 1=1';
    const args: string[] = [];

    if (source) {
      where += ' AND source = ?';
      args.push(source);
    }
    if (status) {
      where += ' AND status = ?';
      args.push(status);
    }
    if (startDate) {
      where += ' AND date(subscribed_at) >= ?';
      args.push(startDate);
    }
    if (endDate) {
      where += ' AND date(subscribed_at) <= ?';
      args.push(endDate);
    }

    const subscribers = await queryAll<EmailSubscriber>(
      `SELECT * FROM email_subscribers ${where} ORDER BY subscribed_at DESC`,
      args
    );

    const safeSubscribers = Array.isArray(subscribers) ? subscribers : [];
    const headers = [
      'email',
      'name',
      'source',
      'lead_magnet',
      'status',
      'subscribed_at',
      'unsubscribed_at',
    ];
    const csvRows = [headers.join(',')];

    for (const sub of safeSubscribers) {
      const row = [
        `"${(sub.email ?? '').replace(/"/g, '""')}"`,
        `"${(sub.name ?? '').replace(/"/g, '""')}"`,
        `"${(sub.source ?? '').replace(/"/g, '""')}"`,
        `"${(sub.lead_magnet ?? '').replace(/"/g, '""')}"`,
        `"${sub.status ?? 'active'}"`,
        `"${sub.subscribed_at ?? ''}"`,
        `"${sub.unsubscribed_at ?? ''}"`,
      ];
      csvRows.push(row.join(','));
    }

    return new NextResponse(csvRows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=subscribers-export-${new Date().toISOString().slice(0, 10)}.csv`,
      },
    });
  } catch (error) {
    console.error('Subscribers export error:', error);
    return NextResponse.json(
      { error: 'Failed to export subscribers' },
      { status: 500 }
    );
  }
}
