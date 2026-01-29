/**
 * Backup API Route
 * POST /api/backup - Create a backup (database + uploads)
 * GET /api/backup - List available backups
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/db';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { createWriteStream } from 'fs';

const execAsync = promisify(exec);

// Backup directory
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

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
    // Also check if user is admin
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

// Ensure backup directory exists
async function ensureBackupDir() {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  }
}

// GET - List available backups
export async function GET() {
  try {
    const authCheck = await checkAdminPermission();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    await ensureBackupDir();

    const files = await fs.readdir(BACKUP_DIR);
    const backups = await Promise.all(
      files
        .filter(f => f.endsWith('.zip'))
        .map(async (filename) => {
          const filepath = path.join(BACKUP_DIR, filename);
          const stats = await fs.stat(filepath);
          
          // Parse backup type from filename
          // Format: backup_full_2026-01-30_123456.zip or backup_db_2026-01-30_123456.zip
          const match = filename.match(/backup_(full|db|files)_(\d{4}-\d{2}-\d{2})_(\d{6})\.zip/);
          
          return {
            filename,
            type: match ? match[1] : 'unknown',
            date: match ? match[2] : 'unknown',
            time: match ? match[3].replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3') : 'unknown',
            size: stats.size,
            sizeFormatted: formatBytes(stats.size),
            createdAt: stats.birthtime.toISOString(),
          };
        })
    );

    // Sort by date descending
    backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: backups,
    });
  } catch (error) {
    console.error('Error listing backups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list backups' },
      { status: 500 }
    );
  }
}

// POST - Create a new backup
export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkAdminPermission();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const { type = 'full' } = body; // full, db, files

    await ensureBackupDir();

    const timestamp = new Date();
    const dateStr = timestamp.toISOString().split('T')[0];
    const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '');
    const backupName = `backup_${type}_${dateStr}_${timeStr}`;

    let dbBackupPath: string | null = null;
    let finalBackupPath: string;

    // Create database backup if needed
    if (type === 'full' || type === 'db') {
      dbBackupPath = path.join(BACKUP_DIR, `${backupName}_db.sql`);
      
      // Get database connection info from environment
      const dbUrl = process.env.DATABASE_URL || '';
      const dbMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      
      if (!dbMatch) {
        return NextResponse.json(
          { success: false, error: 'Invalid database URL' },
          { status: 500 }
        );
      }

      const [, dbUser, dbPass, dbHost, dbPort, dbName] = dbMatch;
      
      // Run pg_dump
      const dumpCommand = `PGPASSWORD="${dbPass}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -f "${dbBackupPath}"`;
      
      try {
        await execAsync(dumpCommand);
      } catch (dumpError) {
        console.error('pg_dump error:', dumpError);
        return NextResponse.json(
          { success: false, error: 'Database backup failed' },
          { status: 500 }
        );
      }
    }

    // Create zip archive
    finalBackupPath = path.join(BACKUP_DIR, `${backupName}.zip`);
    
    await new Promise<void>((resolve, reject) => {
      const output = createWriteStream(finalBackupPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));

      archive.pipe(output);

      // Add database dump if exists
      if (dbBackupPath) {
        archive.file(dbBackupPath, { name: 'database.sql' });
      }

      // Add uploads folder if needed
      if (type === 'full' || type === 'files') {
        archive.directory(UPLOADS_DIR, 'uploads');
      }

      archive.finalize();
    });

    // Clean up temporary SQL file
    if (dbBackupPath) {
      try {
        await fs.unlink(dbBackupPath);
      } catch {
        // Ignore cleanup errors
      }
    }

    // Get final file size
    const stats = await fs.stat(finalBackupPath);

    return NextResponse.json({
      success: true,
      data: {
        filename: `${backupName}.zip`,
        type,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
        createdAt: timestamp.toISOString(),
      },
      message: type === 'full' 
        ? 'Full backup created successfully'
        : type === 'db' 
          ? 'Database backup created successfully'
          : 'Files backup created successfully',
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
