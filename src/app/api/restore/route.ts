/**
 * Restore API Route
 * POST /api/restore - Restore from a backup file
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/db';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { createWriteStream, existsSync } from 'fs';
import unzipper from 'unzipper';

const execAsync = promisify(exec);

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const TEMP_DIR = path.join(process.cwd(), 'backups', 'temp');

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

// Clean up temp directory
async function cleanupTemp() {
  try {
    if (existsSync(TEMP_DIR)) {
      await fs.rm(TEMP_DIR, { recursive: true, force: true });
    }
  } catch {
    // Ignore cleanup errors
  }
}

// Ensure temp directory exists
async function ensureTempDir() {
  await cleanupTemp();
  await fs.mkdir(TEMP_DIR, { recursive: true });
}

// POST - Restore from backup
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
    const { filename, restoreDb = true, restoreFiles = true } = body;

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Validate filename
    if (filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename' },
        { status: 400 }
      );
    }

    const backupPath = path.join(BACKUP_DIR, filename);

    if (!existsSync(backupPath)) {
      return NextResponse.json(
        { success: false, error: 'Backup file not found' },
        { status: 404 }
      );
    }

    await ensureTempDir();

    // Extract backup to temp directory
    await new Promise<void>((resolve, reject) => {
      const readStream = require('fs').createReadStream(backupPath);
      readStream
        .pipe(unzipper.Extract({ path: TEMP_DIR }))
        .on('close', () => resolve())
        .on('error', (err: Error) => reject(err));
    });

    const results = {
      database: false,
      files: false,
    };

    // Restore database if requested and SQL file exists
    const sqlPath = path.join(TEMP_DIR, 'database.sql');
    if (restoreDb && existsSync(sqlPath)) {
      const dbUrl = process.env.DATABASE_URL || '';
      const dbMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      
      if (dbMatch) {
        const [, dbUser, dbPass, dbHost, dbPort, dbName] = dbMatch;
        
        // Run psql to restore
        const restoreCommand = `PGPASSWORD="${dbPass}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f "${sqlPath}"`;
        
        try {
          await execAsync(restoreCommand);
          results.database = true;
        } catch (restoreError) {
          console.error('Database restore error:', restoreError);
          // Continue with file restore even if DB fails
        }
      }
    }

    // Restore files if requested and uploads folder exists
    const uploadsPath = path.join(TEMP_DIR, 'uploads');
    if (restoreFiles && existsSync(uploadsPath)) {
      try {
        // Copy uploads folder
        await copyDirectory(uploadsPath, UPLOADS_DIR);
        results.files = true;
      } catch (copyError) {
        console.error('Files restore error:', copyError);
      }
    }

    // Clean up temp directory
    await cleanupTemp();

    // Build result message
    const messages = [];
    if (results.database) messages.push('Database restored');
    if (results.files) messages.push('Files restored');
    
    if (messages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nothing was restored. The backup may not contain the requested data.',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: messages.join(' and ') + ' successfully',
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    await cleanupTemp();
    return NextResponse.json(
      { success: false, error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}

// Helper to recursively copy directory
async function copyDirectory(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}
