/**
 * Avatar Upload API Route
 * Dedicated endpoint for avatar/profile picture uploads
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync, readdirSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for avatars
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Generate unique filename
function generateFileName(ext: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}${ext}`;
}

// Ensure upload directory exists
async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Delete old avatar files for a user (optional cleanup)
async function deleteOldAvatars(userId: string): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) return;
  
  try {
    const files = readdirSync(UPLOAD_DIR);
    const userAvatars = files.filter(f => f.startsWith(`user-${userId}-`));
    
    for (const file of userAvatars) {
      await unlink(path.join(UPLOAD_DIR, file));
    }
  } catch (error) {
    console.warn('Failed to cleanup old avatars:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided', code: 'NO_FILE' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          message: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          code: 'FILE_TOO_LARGE' 
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Only JPEG, PNG, and WebP images are allowed',
          code: 'INVALID_TYPE' 
        },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate filename
    const ext = path.extname(file.name).toLowerCase() || '.jpg';
    const fileName = userId 
      ? `user-${userId}-${Date.now()}${ext}`
      : generateFileName(ext);
    
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Delete old avatars for this user if userId provided
    if (userId) {
      await deleteOldAvatars(userId);
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate URL with cache-busting
    const url = `/uploads/avatars/${fileName}`;
    const thumbnailUrl = url; // Same for now, could generate actual thumbnail

    return NextResponse.json({
      success: true,
      url,
      thumbnailUrl,
      fileId: fileName.split('.')[0],
      fileName,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error', 
        code: 'SERVER_ERROR' 
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove avatar
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const userId = searchParams.get('userId');

    if (!fileName && !userId) {
      return NextResponse.json(
        { success: false, message: 'fileName or userId required', code: 'MISSING_PARAM' },
        { status: 400 }
      );
    }

    if (fileName) {
      const filePath = path.join(UPLOAD_DIR, fileName);
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } else if (userId) {
      await deleteOldAvatars(userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Avatar delete error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error', 
        code: 'SERVER_ERROR' 
      },
      { status: 500 }
    );
  }
}
