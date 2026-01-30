import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { userHasPermission } from '@/lib/permissions/queries';
import { query } from '@/db';

/**
 * GET /api/hr/stats
 * Get HR statistics
 */
export async function GET(request: NextRequest) {
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

    try {
      // Get total employees
      const totalResult = await query(
        'SELECT COUNT(*) as count FROM hr_employees'
      );
      const total_employees = parseInt(totalResult.rows[0].count);

      // Get active employees
      const activeResult = await query(
        "SELECT COUNT(*) as count FROM hr_employees WHERE employment_status = 'active'"
      );
      const active_employees = parseInt(activeResult.rows[0].count);

      // Get on leave employees
      const onLeaveResult = await query(
        "SELECT COUNT(*) as count FROM hr_employees WHERE employment_status = 'on-leave'"
      );
      const on_leave = parseInt(onLeaveResult.rows[0].count);

      // Get total payroll
      const payrollResult = await query(`
        SELECT COALESCE(SUM(s.total_salary), 0) as total
        FROM hr_salaries s
        INNER JOIN (
          SELECT employee_id, MAX(effective_date) as max_date
          FROM hr_salaries
          GROUP BY employee_id
        ) latest ON s.employee_id = latest.employee_id AND s.effective_date = latest.max_date
        INNER JOIN hr_employees e ON s.employee_id = e.id
        WHERE e.employment_status = 'active'
      `);
      const total_payroll = parseFloat(payrollResult.rows[0].total);

      // Get pending leaves
      const pendingLeavesResult = await query(
        "SELECT COUNT(*) as count FROM hr_leaves WHERE status = 'pending'"
      );
      const pending_leaves = parseInt(pendingLeavesResult.rows[0].count);

      // Get average attendance rate (placeholder - would need actual calculation)
      const avg_attendance = 95;

      return NextResponse.json({
        total_employees,
        active_employees,
        on_leave,
        total_payroll,
        pending_leaves,
        avg_attendance,
      });
    } catch (error) {
      console.error('Error getting HR stats:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in HR stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
