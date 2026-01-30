import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { userHasPermission } from '@/lib/permissions/queries';
import { query as dbQuery } from '@/db';

/**
 * GET /api/hr/employees/[id]/documents
 * Get documents for an employee
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const hasPermission = await userHasPermission(payload.userId, 'menu.hr');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const result = await dbQuery(
      `SELECT 
        d.id,
        d.document_type,
        d.document_name,
        d.file_url,
        d.issue_date,
        d.expiry_date,
        d.notes,
        d.created_at,
        u.full_name as uploaded_by_name
      FROM hr_documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.employee_id = $1
      ORDER BY d.created_at DESC`,
      [id]
    );

    // Check for expiring documents (within 30 days)
    const expiringResult = await dbQuery(
      `SELECT COUNT(*) as count
       FROM hr_documents
       WHERE employee_id = $1 
         AND expiry_date IS NOT NULL 
         AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
         AND expiry_date >= CURRENT_DATE`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        documents: result.rows,
        expiringCount: parseInt(expiringResult.rows[0]?.count || '0'),
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hr/employees/[id]/documents
 * Upload a new document
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const hasPermission = await userHasPermission(payload.userId, 'menu.hr');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { document_type, document_name, file_url, issue_date, expiry_date, notes } = body;

    if (!document_type || !document_name || !file_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await dbQuery(
      `INSERT INTO hr_documents (
        employee_id, document_type, document_name, file_url,
        issue_date, expiry_date, notes, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        id,
        document_type,
        document_name,
        file_url,
        issue_date || null,
        expiry_date || null,
        notes || null,
        payload.userId,
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hr/employees/[id]/documents
 * Delete a document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const hasPermission = await userHasPermission(payload.userId, 'menu.hr');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { document_id } = body;

    if (!document_id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    await dbQuery(`DELETE FROM hr_documents WHERE id = $1`, [document_id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
