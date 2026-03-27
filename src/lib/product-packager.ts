/**
 * Product repackaging: downloads a product ZIP, converts .md/.txt to branded
 * PDFs, and re-uploads a new ZIP with PDFs/ + Raw-Files/ folders.
 */

import AdmZip from 'adm-zip';
import { markdownToBrandedHTML } from '@/lib/pdf-template';
import { htmlToPdfBatch } from '@/lib/pdf-generator';
import { uploadToBlob, deleteFromBlob, isBlobConfigured } from '@/lib/blob';
import { queryOne, execute } from '@/lib/db';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductRecord {
  id: string;
  name: string;
  file_url: string | null;
  file_name: string | null;
  [key: string]: unknown;
}

export interface RepackageResult {
  url: string;
  size: number;
  pdfCount: number;
  rawFileCount: number;
  otherFileCount: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sanitize a ZIP entry path — reject traversal attempts. */
function sanitizePath(name: string): string | null {
  const normalized = name.replace(/\\/g, '/');
  if (normalized.startsWith('/') || normalized.includes('..')) return null;
  return normalized;
}

/** Check whether a filename is a markdown/text file we should convert. */
function isConvertible(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith('.md') || lower.endsWith('.txt') || lower.endsWith('.markdown');
}

/** Derive a PDF filename from the original (e.g. guide.md → guide.pdf). */
function toPdfName(name: string): string {
  return name.replace(/\.(md|txt|markdown)$/i, '.pdf');
}

/** Detect variant from filename. */
function detectVariant(name: string): 'guide' | 'cheatsheet' | 'workbook' {
  const lower = name.toLowerCase();
  if (lower.includes('cheat') || lower.includes('cheatsheet')) return 'cheatsheet';
  if (lower.includes('workbook')) return 'workbook';
  return 'guide';
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

/**
 * Repackage a product's download file:
 * 1. Download current ZIP from blob storage
 * 2. Extract .md/.txt → convert to branded PDFs
 * 3. Build new ZIP: PDFs/ + Raw-Files/ + other files at root
 * 4. Upload new ZIP, delete old, update DB
 */
export async function repackageProduct(
  productId: string,
  productName: string,
): Promise<RepackageResult> {
  if (!isBlobConfigured()) {
    throw new Error('Blob storage not configured');
  }

  // 1. Fetch product record
  const product = await queryOne<ProductRecord>(
    'SELECT * FROM products WHERE id = ?',
    [productId],
  );
  if (!product) throw new Error(`Product ${productId} not found`);
  if (!product.file_url) throw new Error(`Product ${productId} has no file`);

  // 2. Download current ZIP
  const response = await fetch(product.file_url);
  if (!response.ok) {
    throw new Error(`Failed to download product file: ${response.status} ${response.statusText}`);
  }
  const zipBuffer = Buffer.from(await response.arrayBuffer());
  console.log(`[PDF-REGEN] Downloaded ZIP: ${zipBuffer.length} bytes`);

  // 3. Read the ZIP
  const sourceZip = new AdmZip(zipBuffer);
  const entries = sourceZip.getEntries();
  console.log(`[PDF-REGEN] ZIP entries: ${entries.length}`);
  for (const entry of entries) {
    console.log(`[PDF-REGEN]   entry: ${entry.entryName} (dir=${entry.isDirectory}, size=${entry.header.size})`);
  }

  // 4. Categorize entries
  const convertibleEntries: { entry: AdmZip.IZipEntry; relativePath: string }[] = [];
  const otherEntries: { entry: AdmZip.IZipEntry; relativePath: string }[] = [];

  for (const entry of entries) {
    if (entry.isDirectory) continue;

    // Sanitize path — reject traversal attempts
    const safePath = sanitizePath(entry.entryName);
    if (!safePath) continue;

    // Skip macOS resource forks and hidden files
    if (safePath.includes('__MACOSX') || safePath.split('/').some(p => p.startsWith('.'))) {
      continue;
    }

    // Skip files already in PDFs/ or Raw-Files/ directories from previous runs
    // (they'll be regenerated/re-added by the repackaging process)
    const topDir = safePath.split('/')[0];
    if (topDir === 'PDFs' || topDir === 'Raw-Files') {
      // Only treat raw convertible files as convertible (they're in Raw-Files/)
      if (isConvertible(safePath)) {
        convertibleEntries.push({ entry, relativePath: safePath });
      }
      // Skip everything else in PDFs/ and Raw-Files/ — they'll be regenerated
      continue;
    }

    if (isConvertible(safePath)) {
      convertibleEntries.push({ entry, relativePath: safePath });
    } else {
      otherEntries.push({ entry, relativePath: safePath });
    }
  }

  console.log(`[PDF-REGEN] Convertible: ${convertibleEntries.length}, Other: ${otherEntries.length}`);
  convertibleEntries.forEach(e => console.log(`[PDF-REGEN]   convertible: ${e.relativePath}`));

  // 5. Convert each .md/.txt to PDF (batch: single Chromium instance)
  const pdfMeta: { name: string }[] = [];
  const htmlDocs: string[] = [];

  for (const { entry, relativePath } of convertibleEntries) {
    const content = entry.getData().toString('utf-8');
    const baseName = relativePath.split('/').pop() || relativePath;
    const pdfName = toPdfName(baseName);
    const variant = detectVariant(baseName);

    const html = markdownToBrandedHTML(content, {
      title: productName,
      variant,
      subtitle: baseName.replace(/\.(md|txt|markdown)$/i, ''),
    });

    htmlDocs.push(html);
    pdfMeta.push({ name: pdfName });
  }

  const pdfBuffers = await htmlToPdfBatch(htmlDocs);
  console.log(`[PDF-REGEN] Generated ${pdfBuffers.length} PDFs`);
  const pdfResults = pdfMeta.map((meta, i) => ({
    name: meta.name,
    buffer: pdfBuffers[i],
  }));

  // 6. Build new ZIP
  const newZip = new AdmZip();

  // PDFs/ folder
  for (const { name, buffer } of pdfResults) {
    newZip.addFile(`PDFs/${name}`, buffer);
  }

  // Raw-Files/ folder — original .md/.txt files
  for (const { entry, relativePath } of convertibleEntries) {
    const baseName = relativePath.split('/').pop() || relativePath;
    newZip.addFile(`Raw-Files/${baseName}`, entry.getData());
  }

  // Other files at root (or preserve their relative path)
  for (const { entry, relativePath } of otherEntries) {
    newZip.addFile(relativePath, entry.getData());
  }

  const newZipBuffer = newZip.toBuffer();

  // 7. Upload new ZIP to blob
  const newFileName = product.file_name
    ? product.file_name.replace(/-with-pdfs\.zip$/i, '.zip').replace(/\.zip$/i, '-with-pdfs.zip')
    : `${productName.replace(/[^a-zA-Z0-9-_ ]/g, '').trim()}-with-pdfs.zip`;

  const blob = await uploadToBlob(newFileName, newZipBuffer, {
    contentType: 'application/zip',
    folder: `products/${productId}`,
  });
  console.log(`[PDF-REGEN] Uploaded new ZIP: ${blob.url} (${newZipBuffer.length} bytes)`);

  // 8. Delete old ZIP from blob
  try {
    await deleteFromBlob(product.file_url);
  } catch {
    // Non-critical: old file may already be gone
  }

  // 9. Update DB
  await execute(
    `UPDATE products SET file_url = ?, file_name = ?, file_size_bytes = ?, updated_at = datetime('now') WHERE id = ?`,
    [blob.url, newFileName, newZipBuffer.length, productId],
  );

  return {
    url: blob.url,
    size: newZipBuffer.length,
    pdfCount: pdfResults.length,
    rawFileCount: convertibleEntries.length,
    otherFileCount: otherEntries.length,
  };
}
