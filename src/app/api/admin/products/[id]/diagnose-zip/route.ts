import { NextRequest, NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { queryOne } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

/**
 * GET /api/admin/products/[id]/diagnose-zip
 *
 * Diagnostic endpoint: downloads the product's ZIP and reports what entries
 * it contains, which are convertible to PDF, etc. — without performing any
 * conversion. Useful for debugging PDF regeneration issues.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const product = await queryOne<{
      id: string;
      name: string;
      file_url: string | null;
      file_name: string | null;
    }>('SELECT id, name, file_url, file_name FROM products WHERE id = ?', [id]);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!product.file_url) {
      return NextResponse.json(
        { error: 'Product has no uploaded file' },
        { status: 400 },
      );
    }

    // Download the ZIP
    const response = await fetch(product.file_url);
    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to download ZIP: ${response.status} ${response.statusText}`,
          file_url: product.file_url,
        },
        { status: 502 },
      );
    }

    const zipBuffer = Buffer.from(await response.arrayBuffer());
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();

    const CONVERTIBLE_EXTENSIONS = ['.md', '.txt', '.markdown'];

    const entries: {
      name: string;
      isDirectory: boolean;
      size: number;
      compressedSize: number;
    }[] = [];

    const convertible: string[] = [];
    const other: string[] = [];
    const skipped: { name: string; reason: string }[] = [];

    for (const entry of zipEntries) {
      entries.push({
        name: entry.entryName,
        isDirectory: entry.isDirectory,
        size: entry.header.size,
        compressedSize: entry.header.compressedSize,
      });

      if (entry.isDirectory) {
        skipped.push({ name: entry.entryName, reason: 'directory' });
        continue;
      }

      const normalized = entry.entryName.replace(/\\/g, '/');

      // Check for path traversal
      if (normalized.startsWith('/') || normalized.includes('..')) {
        skipped.push({ name: entry.entryName, reason: 'path traversal' });
        continue;
      }

      // Check for macOS resource forks and hidden files
      if (
        normalized.includes('__MACOSX') ||
        normalized.split('/').some((p) => p.startsWith('.'))
      ) {
        skipped.push({ name: entry.entryName, reason: 'hidden/macosx' });
        continue;
      }

      const lower = normalized.toLowerCase();
      const isConvertibleFile = CONVERTIBLE_EXTENSIONS.some((ext) =>
        lower.endsWith(ext),
      );

      if (isConvertibleFile) {
        convertible.push(normalized);
      } else {
        other.push(normalized);
      }
    }

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        file_url: product.file_url,
        file_name: product.file_name,
      },
      zipSize: zipBuffer.length,
      totalEntries: zipEntries.length,
      entries,
      convertible,
      other,
      skipped,
      summary: {
        convertibleCount: convertible.length,
        otherCount: other.length,
        skippedCount: skipped.length,
      },
    });
  } catch (error) {
    console.error('ZIP diagnosis error:', error);
    const message =
      error instanceof Error ? error.message : 'Diagnosis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
