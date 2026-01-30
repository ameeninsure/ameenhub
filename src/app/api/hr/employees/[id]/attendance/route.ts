import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { userHasPermission } from '@/lib/permissions/queries';
import { query as dbQuery } from '@/db';

/**
 * GET /api/hr/employees/[id]/attendance
 * Get attendance records for an employee
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
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // YYYY-MM format
    const year = searchParams.get('year');

    let queryText = `
      SELECT 
        a.id,
        a.date,
        a.check_in_time,
        a.check_out_time,
        a.work_hours,
        a.status,
        a.is_overtime,
        a.overtime_hours,
        a.notes
      FROM hr_attendance a
      WHERE a.employee_id = $1
    `;
    const queryParams: any[] = [id];

    if (month) {
      queryText += ` AND TO_CHAR(a.date, 'YYYY-MM') = $2`;
      queryParams.push(month);
    } else if (year) {
      queryText += ` AND EXTRACT(YEAR FROM a.date) = $2`;
      queryParams.push(year);
    } else {
      // Default: last 30 days
      queryText += ` AND a.date >= CURRENT_DATE - INTERVAL '30 days'`;
    }

    queryText += ` ORDER BY a.date DESC`;

    const result = await dbQuery(queryText, queryParams);

    // Get summary stats
    const statsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'present') as present_days,
        COUNT(*) FILTER (WHERE status = 'absent') as absent_days,
        COUNT(*) FILTER (WHERE status = 'late') as late_days,
        COUNT(*) FILTER (WHERE status = 'on-leave') as leave_days,
        COALESCE(SUM(work_hours), 0) as total_work_hours,
        COALESCE(SUM(overtime_hours), 0) as total_overtime_hours
      FROM hr_attendance
      WHERE employee_id = $1
        AND date >= DATE_TRUNC('month', CURRENT_DATE)
    `;
    const statsResult = await dbQuery(statsQuery, [id]);

    return NextResponse.json({
      success: true,
      data: {
        records: result.rows,
        stats: statsResult.rows[0],
      },
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hr/employees/[id]/attendance
 * Add attendance record for an employee
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
    const { date, check_in_time, check_out_time, status, notes, is_overtime, overtime_hours } = body;

    // Calculate work hours if both check in and out provided
    let work_hours = null;
    if (check_in_time && check_out_time) {
      const checkIn = new Date(check_in_time);
      const checkOut = new Date(check_out_time);
      work_hours = ((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(2);
    }

    const result = await dbQuery(
      `INSERT INTO hr_attendance (
        employee_id, date, check_in_time, check_out_time, 
        work_hours, status, is_overtime, overtime_hours, notes, recorded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (employee_id, date) 
      DO UPDATE SET 
        check_in_time = EXCLUDED.check_in_time,
        check_out_time = EXCLUDED.check_out_time,
        work_hours = EXCLUDED.work_hours,
        status = EXCLUDED.status,
        is_overtime = EXCLUDED.is_overtime,
        overtime_hours = EXCLUDED.overtime_hours,
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id`,
      [
        id,
        date,
        check_in_time || null,
        check_out_time || null,
        work_hours,
        status || 'present',
        is_overtime || false,
        overtime_hours || 0,
        notes || null,
        payload.userId,
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Error adding attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
