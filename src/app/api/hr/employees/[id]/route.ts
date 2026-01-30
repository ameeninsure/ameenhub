import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { userHasPermission } from '@/lib/permissions/queries';
import { query as dbQuery } from '@/db';

/**
 * GET /api/hr/employees/[id]
 * Get single employee with all details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;
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

    try {
      // Get employee basic info
      const employeeResult = await dbQuery(
        `SELECT 
          e.*,
          u.full_name,
          u.full_name_ar,
          u.email,
          u.phone,
          u.avatar_url,
          u.preferred_language
        FROM hr_employees e
        INNER JOIN users u ON e.user_id = u.id
        WHERE e.id = $1`,
        [employeeId]
      );

      if (employeeResult.rows.length === 0) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }

      const employee = employeeResult.rows[0];

      // Get current salary info
      const salaryResult = await dbQuery(
        `SELECT * FROM hr_salaries
         WHERE employee_id = $1
         ORDER BY effective_date DESC
         LIMIT 1`,
        [employeeId]
      );
      employee.salary_info = salaryResult.rows[0] || null;

      // Get leave balance
      const currentYear = new Date().getFullYear();
      const leaveBalanceResult = await dbQuery(
        `SELECT * FROM hr_leave_balance
         WHERE employee_id = $1 AND year = $2`,
        [employeeId, currentYear]
      );
      employee.leave_balance = leaveBalanceResult.rows[0] || null;

      // Get attendance summary (last 30 days)
      const attendanceResult = await dbQuery(
        `SELECT 
          COUNT(*) as total_days,
          COUNT(*) FILTER (WHERE status = 'present') as present_days,
          COUNT(*) FILTER (WHERE status = 'absent') as absent_days,
          COUNT(*) FILTER (WHERE status = 'late') as late_days,
          COALESCE(SUM(overtime_hours), 0) as total_overtime
         FROM hr_attendance
         WHERE employee_id = $1
         AND date >= CURRENT_DATE - INTERVAL '30 days'`,
        [employeeId]
      );
      employee.attendance_summary = attendanceResult.rows[0];

      // Get recent leaves
      const leavesResult = await dbQuery(
        `SELECT * FROM hr_leaves
         WHERE employee_id = $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [employeeId]
      );
      employee.recent_leaves = leavesResult.rows;

      // Get commission summary
      const commissionResult = await dbQuery(
        `SELECT 
          COUNT(*) as total_count,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(SUM(amount) FILTER (WHERE payment_status = 'paid'), 0) as paid_amount,
          COALESCE(SUM(amount) FILTER (WHERE payment_status = 'pending'), 0) as pending_amount
         FROM hr_commissions
         WHERE employee_id = $1`,
        [employeeId]
      );
      employee.commission_summary = commissionResult.rows[0];

      // Get documents count
      const documentsResult = await dbQuery(
        `SELECT COUNT(*) as count FROM hr_documents WHERE employee_id = $1`,
        [employeeId]
      );
      employee.documents_count = parseInt(documentsResult.rows[0].count);

      return NextResponse.json(employee);
    } catch (error) {
      console.error('Error getting employee:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in employee GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/hr/employees/[id]
 * Update employee information
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;
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

    try {
      const {
        department,
        department_ar,
        job_title,
        job_title_ar,
        employment_type,
        employment_status,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relation,
        national_id,
        passport_number,
        notes,
      } = body;

      await dbQuery(
        `UPDATE hr_employees SET
          department = $1,
          department_ar = $2,
          job_title = $3,
          job_title_ar = $4,
          employment_type = $5,
          employment_status = $6,
          emergency_contact_name = $7,
          emergency_contact_phone = $8,
          emergency_contact_relation = $9,
          national_id = $10,
          passport_number = $11,
          notes = $12,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $13`,
        [
          department,
          department_ar,
          job_title,
          job_title_ar,
          employment_type,
          employment_status,
          emergency_contact_name,
          emergency_contact_phone,
          emergency_contact_relation,
          national_id,
          passport_number,
          notes,
          employeeId,
        ]
      );

      return NextResponse.json({ message: 'Employee updated successfully' });
    } catch (error) {
      console.error('Error updating employee:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in employee PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hr/employees/[id]
 * Delete employee record
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const employeeId = params.id;

    try {
      await dbQuery('DELETE FROM hr_employees WHERE id = $1', [employeeId]);
      return NextResponse.json({ message: 'Employee deleted successfully' });
    } catch (error) {
      console.error('Error deleting employee:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in employee DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
