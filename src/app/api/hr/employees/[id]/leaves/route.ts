import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { userHasPermission } from '@/lib/permissions/queries';
import { query as dbQuery } from '@/db';

/**
 * GET /api/hr/employees/[id]/leaves
 * Get leave records and balance for an employee
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
    const currentYear = new Date().getFullYear();

    // Get leave balance
    const balanceResult = await dbQuery(
      `SELECT 
        annual_leave_total,
        annual_leave_used,
        annual_leave_remaining,
        sick_leave_total,
        sick_leave_used,
        sick_leave_remaining,
        emergency_leave_total,
        emergency_leave_used,
        emergency_leave_remaining
      FROM hr_leave_balance
      WHERE employee_id = $1 AND year = $2`,
      [id, currentYear]
    );

    // Get leave records
    const leavesResult = await dbQuery(
      `SELECT 
        l.id,
        l.leave_type,
        l.start_date,
        l.end_date,
        l.total_days,
        l.reason,
        l.status,
        l.approval_notes,
        l.approval_date,
        u.full_name as approved_by_name
      FROM hr_leaves l
      LEFT JOIN users u ON l.approved_by = u.id
      WHERE l.employee_id = $1
      ORDER BY l.start_date DESC
      LIMIT 50`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        balance: balanceResult.rows[0] || {
          annual_leave_total: 21,
          annual_leave_used: 0,
          annual_leave_remaining: 21,
          sick_leave_total: 15,
          sick_leave_used: 0,
          sick_leave_remaining: 15,
          emergency_leave_total: 5,
          emergency_leave_used: 0,
          emergency_leave_remaining: 5,
        },
        leaves: leavesResult.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hr/employees/[id]/leaves
 * Request a new leave
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
    const { leave_type, start_date, end_date, reason } = body;

    if (!leave_type || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate total days
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const total_days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const result = await dbQuery(
      `INSERT INTO hr_leaves (
        employee_id, leave_type, start_date, end_date, total_days, reason, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING id`,
      [id, leave_type, start_date, end_date, total_days, reason || null]
    );

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/hr/employees/[id]/leaves
 * Approve or reject a leave request
 */
export async function PUT(
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
    const { leave_id, status, approval_notes } = body;

    if (!leave_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update leave status
    await dbQuery(
      `UPDATE hr_leaves 
       SET status = $1, 
           approved_by = $2, 
           approval_date = CURRENT_TIMESTAMP,
           approval_notes = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [status, payload.userId, approval_notes || null, leave_id]
    );

    // If approved, update leave balance
    if (status === 'approved') {
      const leaveResult = await dbQuery(
        `SELECT employee_id, leave_type, total_days FROM hr_leaves WHERE id = $1`,
        [leave_id]
      );
      
      if (leaveResult.rows.length > 0) {
        const leave = leaveResult.rows[0];
        const currentYear = new Date().getFullYear();
        const columnMap: Record<string, string> = {
          'annual': 'annual_leave_used',
          'sick': 'sick_leave_used',
          'emergency': 'emergency_leave_used',
        };
        const column = columnMap[leave.leave_type];
        
        if (column) {
          await dbQuery(
            `UPDATE hr_leave_balance 
             SET ${column} = ${column} + $1, updated_at = CURRENT_TIMESTAMP
             WHERE employee_id = $2 AND year = $3`,
            [leave.total_days, leave.employee_id, currentYear]
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating leave:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
