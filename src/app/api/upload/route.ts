/**
 * Upload API Route
 * Handles file uploads with validation and storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Configuration
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Allowed MIME types per category
const ALLOWED_TYPES: Record<string, string[]> = {
  avatar: ['image/jpeg', 'image/png', 'image/webp'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
  'hr-document': [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  attachment: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/zip',
    'application/x-rar-compressed',
    'text/plain',
    'text/csv',
  ],
  logo: ['image/png', 'image/svg+xml', 'image/webp'],
  cover: ['image/jpeg', 'image/png', 'image/webp'],
};

// Generate unique filename
function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName).toLowerCase();
  return `${timestamp}-${random}${ext}`;
}

// Ensure upload directory exists
async function ensureUploadDir(category: string): Promise<string> {
  const categoryDir = path.join(UPLOAD_DIR, category);
  
  if (!existsSync(categoryDir)) {
    await mkdir(categoryDir, { recursive: true });
  }
  
  return categoryDir;
}

// Validate file
function validateFile(
  file: File,
  category: string
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  const allowedTypes = ALLOWED_TYPES[category] || ALLOWED_TYPES.attachment;
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed for ${category}`,
    };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'attachment';
    const originalName = (formData.get('originalName') as string) || file?.name || 'file';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided', code: 'NO_FILE' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file, category);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const uploadDir = await ensureUploadDir(category);

    // Generate unique filename
    const fileName = generateFileName(originalName);
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate URL
    const url = `/uploads/${category}/${fileName}`;

    // Get image dimensions if applicable
    let width: number | undefined;
    let height: number | undefined;
    
    if (file.type.startsWith('image/')) {
      // For server-side image dimension detection, you would use a library like 'sharp'
      // For now, we'll skip this as it requires additional dependencies
    }

    return NextResponse.json({
      success: true,
      url,
      fileId: fileName.split('.')[0],
      fileName,
      fileSize: file.size,
      mimeType: file.type,
      width,
      height,
    });
  } catch (error) {
    console.error('Upload error:', error);
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

// Handle avatar uploads specifically
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided', code: 'NO_FILE' },
        { status: 400 }
      );
    }

    // Validate as avatar
    const validation = validateFile(file, 'avatar');
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Ensure avatar directory exists
    const uploadDir = await ensureUploadDir('avatars');

    // Use user ID for filename if provided
    const fileName = userId 
      ? `${userId}${path.extname(file.name).toLowerCase()}`
      : generateFileName(file.name);
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate URL with cache-busting query
    const url = `/uploads/avatars/${fileName}?v=${Date.now()}`;

    return NextResponse.json({
      success: true,
      url,
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
