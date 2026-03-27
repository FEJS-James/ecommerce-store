import { NextRequest, NextResponse } from 'next/server';
import { markdownToBrandedHTML } from '@/lib/pdf-template';
import { htmlToPdf } from '@/lib/pdf-generator';

export const maxDuration = 60;

const TEST_MD = `# Test Product Guide

This is a test paragraph to verify PDF branding works.

## Section One

Some content here with **bold** and *italic* text.

- Bullet point one
- Bullet point two
- Bullet point three

## Section Two

More content to test the layout.

> **Tip:** This is a helpful tip box that should be styled.

## Section Three

Final section with a code block:

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`
`;

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get('format') || 'pdf';

  try {
    const html = markdownToBrandedHTML(TEST_MD, {
      title: 'AI Armory Test Product',
      variant: 'guide',
      subtitle: 'PDF Branding Verification',
    });

    if (format === 'html') {
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Generate PDF
    const pdfBuffer = await htmlToPdf(html);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="branding-test.pdf"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
