/**
 * Vercel Blob Storage utilities.
 *
 * Wraps @vercel/blob so the rest of the app can import a single helper.
 * Gracefully handles missing BLOB_READ_WRITE_TOKEN (returns null/errors clearly).
 */

export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Allowed MIME types for product file uploads.
 */
export const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'text/csv',
  'image/png',
  'image/jpeg',
]);

/**
 * Allowed MIME types for preview image uploads.
 */
export const ALLOWED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

/** 50 MB in bytes.
 *  NOTE: In serverless environments (e.g. Vercel Functions), buffering a full
 *  50 MB upload in memory can cause significant memory pressure. Monitor
 *  function memory limits and consider streaming or presigned-URL uploads
 *  if OOM errors occur. */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/** 10 MB for preview images */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * Map of allowed file extensions → expected MIME types for defense-in-depth
 * validation. Check both the MIME type AND the extension to catch mismatches.
 */
export const ALLOWED_FILE_EXTENSIONS: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.zip': ['application/zip', 'application/x-zip-compressed'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  '.csv': ['text/csv'],
  '.png': ['image/png'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
};

export const ALLOWED_IMAGE_EXTENSIONS: Record<string, string[]> = {
  '.png': ['image/png'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.webp': ['image/webp'],
  '.gif': ['image/gif'],
};

/**
 * Validate that a file's extension matches its declared MIME type.
 * Returns an error string if mismatched, or null if OK.
 */
export function validateExtensionMime(
  filename: string,
  mimeType: string,
  allowedExtensions: Record<string, string[]>
): string | null {
  const ext = filename.lastIndexOf('.') >= 0
    ? filename.slice(filename.lastIndexOf('.')).toLowerCase()
    : '';

  if (!ext) {
    return `File "${filename}" has no extension`;
  }

  const expectedMimes = allowedExtensions[ext];
  if (!expectedMimes) {
    return `File extension "${ext}" is not allowed`;
  }

  if (!expectedMimes.includes(mimeType)) {
    return `File extension "${ext}" does not match MIME type "${mimeType}"`;
  }

  return null;
}

/**
 * Upload a file to Vercel Blob storage.
 * Returns the blob URL and metadata, or throws with a clear message.
 */
export async function uploadToBlob(
  filename: string,
  body: ReadableStream | Buffer | ArrayBuffer | Blob,
  options?: { contentType?: string; folder?: string }
) {
  if (!isBlobConfigured()) {
    throw new Error('Blob storage not configured. Set BLOB_READ_WRITE_TOKEN environment variable.');
  }

  const { put } = await import('@vercel/blob');

  const pathname = options?.folder
    ? `${options.folder}/${filename}`
    : filename;

  const blob = await put(pathname, body, {
    access: 'public',
    contentType: options?.contentType,
    addRandomSuffix: true,
  });

  return blob;
}

/**
 * Delete a blob by URL.
 */
export async function deleteFromBlob(url: string) {
  if (!isBlobConfigured()) return;

  const { del } = await import('@vercel/blob');
  await del(url);
}
