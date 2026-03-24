import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import {
  uploadToBlob,
  deleteFromBlob,
  isBlobConfigured,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
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
    const product = await queryOne<{ id: string; preview_images: string }>(
      'SELECT id, preview_images FROM products WHERE id = ?',
      [id]
    );
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided. Send one or more "images" fields.' },
        { status: 400 }
      );
    }

    // Validate all files before uploading
    for (const file of files) {
      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Invalid file in upload' }, { status: 400 });
      }
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `Invalid image type: ${file.type}. Allowed: PNG, JPG, WebP, GIF` },
          { status: 400 }
        );
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `Image "${file.name}" too large. Maximum size is 10MB.` },
          { status: 400 }
        );
      }
    }

    // Parse existing preview images
    let existingImages: string[] = [];
    try {
      existingImages = JSON.parse(product.preview_images || '[]');
    } catch {
      existingImages = [];
    }

    // Upload all images
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const blob = await uploadToBlob(file.name, file, {
        contentType: file.type,
        folder: `products/${id}/previews`,
      });
      uploadedUrls.push(blob.url);
    }

    // Merge with existing
    const allImages = [...existingImages, ...uploadedUrls];

    // Update product record
    await execute(
      `UPDATE products SET preview_images = ?, updated_at = datetime('now') WHERE id = ?`,
      [JSON.stringify(allImages), id]
    );

    return NextResponse.json({
      success: true,
      preview_images: allImages,
      uploaded: uploadedUrls,
    });
  } catch (error) {
    console.error('Preview upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE — Remove a specific preview image by URL.
 * Body: { url: string }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const urlToRemove = body.url as string;

    if (!urlToRemove) {
      return NextResponse.json({ error: 'Missing "url" in request body' }, { status: 400 });
    }

    const product = await queryOne<{ id: string; preview_images: string }>(
      'SELECT id, preview_images FROM products WHERE id = ?',
      [id]
    );
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let images: string[] = [];
    try {
      images = JSON.parse(product.preview_images || '[]');
    } catch {
      images = [];
    }

    const filtered = images.filter((url) => url !== urlToRemove);

    // Delete from blob storage
    if (isBlobConfigured()) {
      try {
        await deleteFromBlob(urlToRemove);
      } catch {
        // Non-critical
      }
    }

    await execute(
      `UPDATE products SET preview_images = ?, updated_at = datetime('now') WHERE id = ?`,
      [JSON.stringify(filtered), id]
    );

    return NextResponse.json({ success: true, preview_images: filtered });
  } catch (error) {
    console.error('Preview delete error:', error);
    return NextResponse.json({ error: 'Failed to delete preview' }, { status: 500 });
  }
}
