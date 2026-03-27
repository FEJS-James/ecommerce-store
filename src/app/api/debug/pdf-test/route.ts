import { NextRequest, NextResponse } from 'next/server';
import { markdownToBrandedHTML } from '@/lib/pdf-template';
import { htmlToPdf } from '@/lib/pdf-generator';
import { queryOne } from '@/lib/db';
import AdmZip from 'adm-zip';

export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Helpers — EXACT copies from product-packager.ts
// ---------------------------------------------------------------------------

function sanitizePath(name: string): string | null {
  const normalized = name.replace(/\\/g, '/');
  if (normalized.startsWith('/') || normalized.includes('..')) return null;
  return normalized;
}

function isConvertible(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith('.md') || lower.endsWith('.txt') || lower.endsWith('.markdown');
}

function toPdfName(name: string): string {
  return name.replace(/\.(md|txt|markdown)$/i, '.pdf');
}

function detectVariant(name: string): 'guide' | 'cheatsheet' | 'workbook' {
  const lower = name.toLowerCase();
  if (lower.includes('cheat') || lower.includes('cheatsheet')) return 'cheatsheet';
  if (lower.includes('workbook')) return 'workbook';
  return 'guide';
}

// ---------------------------------------------------------------------------
// Static test content (existing functionality)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Product diagnostic types
// ---------------------------------------------------------------------------

interface ZipEntryInfo {
  name: string;
  size: number;
  isDirectory: boolean;
}

interface CategorizedEntry {
  path: string;
  category: 'convertible' | 'other' | 'skipped';
  skipReason?: string;
}

// ---------------------------------------------------------------------------
// Product diagnostic handler
// ---------------------------------------------------------------------------

async function handleProductDiagnostic(productId: string, download: string | null) {
  // 1. Fetch product from DB
  const product = await queryOne<{
    id: string;
    name: string;
    file_url: string | null;
    file_name: string | null;
  }>('SELECT id, name, file_url, file_name FROM products WHERE id = ?', [productId]);

  if (!product) {
    return NextResponse.json({ error: `Product ${productId} not found` }, { status: 404 });
  }
  if (!product.file_url) {
    return NextResponse.json({ error: `Product ${productId} has no file_url` }, { status: 400 });
  }

  // 2. Download ZIP
  const response = await fetch(product.file_url);
  if (!response.ok) {
    return NextResponse.json(
      { error: `Failed to download ZIP: ${response.status} ${response.statusText}`, file_url: product.file_url },
      { status: 502 },
    );
  }
  const zipBuffer = Buffer.from(await response.arrayBuffer());

  // 3. Extract entries
  const sourceZip = new AdmZip(zipBuffer);
  const entries = sourceZip.getEntries();

  const allEntries: ZipEntryInfo[] = entries.map(e => ({
    name: e.entryName,
    size: e.header.size,
    isDirectory: e.isDirectory,
  }));

  // 4. Categorize — EXACT same logic as product-packager.ts
  const categorized: CategorizedEntry[] = [];
  const convertibleEntries: { entry: AdmZip.IZipEntry; relativePath: string }[] = [];
  const otherEntries: { entry: AdmZip.IZipEntry; relativePath: string }[] = [];

  for (const entry of entries) {
    if (entry.isDirectory) {
      categorized.push({ path: entry.entryName, category: 'skipped', skipReason: 'directory' });
      continue;
    }

    const safePath = sanitizePath(entry.entryName);
    if (!safePath) {
      categorized.push({ path: entry.entryName, category: 'skipped', skipReason: 'path traversal' });
      continue;
    }

    if (safePath.includes('__MACOSX') || safePath.split('/').some(p => p.startsWith('.'))) {
      categorized.push({ path: safePath, category: 'skipped', skipReason: '__MACOSX or hidden file' });
      continue;
    }

    const topDir = safePath.split('/')[0];
    if (topDir === 'PDFs' || topDir === 'Raw-Files') {
      if (isConvertible(safePath)) {
        categorized.push({ path: safePath, category: 'convertible' });
        convertibleEntries.push({ entry, relativePath: safePath });
      } else {
        categorized.push({ path: safePath, category: 'skipped', skipReason: `in ${topDir}/ (non-convertible, will be regenerated)` });
      }
      continue;
    }

    if (isConvertible(safePath)) {
      categorized.push({ path: safePath, category: 'convertible' });
      convertibleEntries.push({ entry, relativePath: safePath });
    } else {
      categorized.push({ path: safePath, category: 'other' });
      otherEntries.push({ entry, relativePath: safePath });
    }
  }

  // 5. Process the FIRST convertible file
  let firstFile: {
    originalPath: string;
    baseName: string;
    pdfName: string;
    variant: string;
    contentPreview: string;
    htmlPreview: string;
    pdfSize: number | null;
    fullHtml?: string;
    pdfBuffer?: Buffer;
  } | null = null;

  if (convertibleEntries.length > 0) {
    const { entry, relativePath } = convertibleEntries[0];
    const content = entry.getData().toString('utf-8');
    const baseName = relativePath.split('/').pop() || relativePath;
    const pdfName = toPdfName(baseName);
    const variant = detectVariant(baseName);

    const html = markdownToBrandedHTML(content, {
      title: product.name,
      variant,
      subtitle: baseName.replace(/\.(md|txt|markdown)$/i, ''),
    });

    // If download requested, generate PDF now
    let pdfBuffer: Buffer | null = null;
    let pdfSize: number | null = null;

    if (download === 'first-pdf' || !download) {
      try {
        pdfBuffer = await htmlToPdf(html);
        pdfSize = pdfBuffer.length;
      } catch (err) {
        pdfSize = null;
        // Include error info in diagnostic
        firstFile = {
          originalPath: relativePath,
          baseName,
          pdfName,
          variant,
          contentPreview: content.slice(0, 200),
          htmlPreview: html.slice(0, 500),
          pdfSize: null,
        };
        // If they wanted the PDF download, return error
        if (download === 'first-pdf') {
          return NextResponse.json({ error: `PDF generation failed: ${err}` }, { status: 500 });
        }
      }
    }

    firstFile = {
      originalPath: relativePath,
      baseName,
      pdfName,
      variant,
      contentPreview: content.slice(0, 200),
      htmlPreview: html.slice(0, 500),
      pdfSize,
      fullHtml: html,
      pdfBuffer: pdfBuffer ?? undefined,
    };
  }

  // 6. Handle download modes
  if (download === 'first-pdf') {
    if (!firstFile?.pdfBuffer) {
      return NextResponse.json({ error: 'No convertible file found or PDF generation failed' }, { status: 400 });
    }
    return new NextResponse(new Uint8Array(firstFile.pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${firstFile.pdfName}"`,
      },
    });
  }

  if (download === 'first-html') {
    if (!firstFile?.fullHtml) {
      return NextResponse.json({ error: 'No convertible file found' }, { status: 400 });
    }
    return new NextResponse(firstFile.fullHtml, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // 7. Return full diagnostic JSON
  return NextResponse.json({
    product: {
      id: product.id,
      name: product.name,
      file_url: product.file_url,
      file_name: product.file_name,
    },
    zip: {
      totalSize: zipBuffer.length,
      entryCount: entries.length,
    },
    allEntries,
    categorized,
    summary: {
      convertible: categorized.filter(e => e.category === 'convertible').map(e => e.path),
      other: categorized.filter(e => e.category === 'other').map(e => e.path),
      skipped: categorized.filter(e => e.category === 'skipped').map(e => ({ path: e.path, reason: e.skipReason })),
    },
    firstConvertibleFile: firstFile
      ? {
          originalPath: firstFile.originalPath,
          baseName: firstFile.baseName,
          pdfName: firstFile.pdfName,
          variant: firstFile.variant,
          contentPreview: firstFile.contentPreview,
          htmlPreview: firstFile.htmlPreview,
          pdfSize: firstFile.pdfSize,
        }
      : null,
  });
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('product');
  const download = request.nextUrl.searchParams.get('download');
  const format = request.nextUrl.searchParams.get('format') || 'pdf';

  try {
    // Product diagnostic mode
    if (productId) {
      return await handleProductDiagnostic(productId, download);
    }

    // Original static test mode
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
