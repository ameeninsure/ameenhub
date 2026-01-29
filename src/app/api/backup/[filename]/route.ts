/**
 * Backup Download API Route
 * GET /api/backup/[filename] - Download a specific backup
 * DELETE /api/backup/[filename] - Delete a specific backup
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/db';
import fs from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Helper to check admin permission
async function checkAdminPermission() {
  const user = await getCurrentUser();
  if (!user) {
    return { authorized: false, error: 'Not authenticated', status: 401 };
  }

  // Check if user has settings.manage permission using the get_user_permissions function
  const permResult = await pool.query(
    `SELECT 1 FROM get_user_permissions($1) WHERE permission_code = 'settings.manage'`,
    [user.userId]
  );

  if (permResult.rows.length === 0) {
    const adminCheck = await pool.query(
      `SELECT 1 FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1 AND r.code IN ('admin', 'super_admin')`,
      [user.userId]
    );
    
    if (adminCheck.rows.length === 0) {
      return { authorized: false, error: 'Access denied', status: 403 };
    }
  }

  return { authorized: true, user };
}

// GET - Download a backup file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const authCheck = await checkAdminPermission();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { filename } = await params;
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename' },
        { status: 400 }
      );
    }

    const filepath = path.join(BACKUP_DIR, filename);

    // Check if file exists
    if (!existsSync(filepath)) {
      return NextResponse.json(
        { success: false, error: 'Backup not found' },
        { status: 404 }
      );
    }

    // Get file stats
    const stats = await fs.stat(filepath);

    // Read file and return as download
    const fileBuffer = await fs.readFile(filepath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': stats.size.toString(),
      },
    });
  } catch (error) {
    console.error('Error downloading backup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to download backup' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a backup file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const authCheck = await checkAdminPermission();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { filename } = await params;
    
    // Validate filename
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename' },
        { status: 400 }
      );
    }

    const filepath = path.join(BACKUP_DIR, filename);

    // Check if file exists
    if (!existsSync(filepath)) {
      return NextResponse.json(
        { success: false, error: 'Backup not found' },
        { status: 404 }
      );
    }

    // Delete the file
    await fs.unlink(filepath);

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete backup' },
      { status: 500 }
    );
  }
}
