import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { queryOne, execute } from '@/lib/db';

const FALLBACK_SECRET = 'newsletter-unsubscribe-fallback-secret-change-me';

function getUnsubscribeSecret(): string {
  return process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || FALLBACK_SECRET;
}

export function generateUnsubscribeToken(email: string): string {
  return createHmac('sha256', getUnsubscribeSecret())
    .update(email.toLowerCase().trim())
    .digest('hex');
}

function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = generateUnsubscribeToken(email);
  if (expected.length !== token.length) return false;

  // Constant-time comparison
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return mismatch === 0;
}

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0A0A0F;
      color: #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 48px;
      max-width: 480px;
      text-align: center;
      backdrop-filter: blur(20px);
    }
    h1 { color: #C4B5FD; margin-bottom: 16px; }
    p { color: #94A3B8; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  const token = request.nextUrl.searchParams.get('token');

  if (!email || !token) {
    return new NextResponse(
      htmlPage('Invalid Link', 'This unsubscribe link is invalid or incomplete.'),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return new NextResponse(
      htmlPage('Invalid Token', 'This unsubscribe link is invalid or has been tampered with.'),
      { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  try {
    const subscriber = await queryOne<{ id: string; status: string }>(
      'SELECT id, status FROM email_subscribers WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!subscriber) {
      return new NextResponse(
        htmlPage('Not Found', 'This email address was not found in our subscriber list.'),
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    if (subscriber.status === 'unsubscribed') {
      return new NextResponse(
        htmlPage('Already Unsubscribed', 'You have already been unsubscribed from our newsletter.'),
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    await execute(
      `UPDATE email_subscribers
       SET status = 'unsubscribed', unsubscribed_at = datetime('now')
       WHERE id = ?`,
      [subscriber.id]
    );

    return new NextResponse(
      htmlPage(
        'Unsubscribed',
        'You have been successfully unsubscribed from our newsletter. You will no longer receive emails from us.'
      ),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new NextResponse(
      htmlPage('Error', 'Something went wrong. Please try again later.'),
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
