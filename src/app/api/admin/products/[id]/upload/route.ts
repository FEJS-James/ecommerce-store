import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import {
  uploadToBlob,
  deleteFromBlob,
  isBlobConfigured,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  ALLOWED_FILE_EXTENSIONS,
  validateExtensionMime,
} from '@/lib/blob';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isBlobConfigured()) {
    return NextResponse.json(
      { error: 'Blob storage not configured. Set BLOB_READ_WRITE_TOKEN on Vercel.' },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;

    // Verify product exists
    const product = await queryOne<{ id: string; file_url: string | null }>(
      'SELECT id, file_url FROM products WHERE id = ?',
      [id]
    );
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided. Send a "file" field.' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${file.type}. Allowed: PDF, ZIP, XLSX, CSV, PNG, JPG`,
        },
        { status: 400 }
      );
    }

    // Defense-in-depth: cross-check file extension against MIME type
    const extError = validateExtensionMime(file.name, file.type, ALLOWED_FILE_EXTENSIONS);
    if (extError) {
      return NextResponse.json({ error: extError }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is 50MB. Got ${(file.size / 1024 / 1024).toFixed(1)}MB.` },
        { status: 400 }
      );
    }

    // Delete old file if exists
    if (product.file_url) {
      try {
        await deleteFromBlob(product.file_url);
      } catch {
        // Non-critical — old file may already be gone
      }
    }

    // Upload to Vercel Blob
    const blob = await uploadToBlob(file.name, file, {
      contentType: file.type,
      folder: `products/${id}`,
    });

    // Update product record
    await execute(
      `UPDATE products SET file_url = ?, file_name = ?, file_size_bytes = ?, updated_at = datetime('now') WHERE id = ?`,
      [blob.url, file.name, file.size, id]
    );

    return NextResponse.json({
      success: true,
      file: {
        url: blob.url,
        name: file.name,
        size: file.size,
        contentType: file.type,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
