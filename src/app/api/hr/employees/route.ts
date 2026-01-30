import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { userHasPermission } from '@/lib/permissions/queries';
import { query as dbQuery } from '@/db';

/**
 * GET /api/hr/employees
 * Get list of HR employees with filters
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const search = searchParams.get('search');

    try {
      let queryText = `
        SELECT 
          e.id,
          e.user_id,
          e.employee_code,
          u.full_name,
          u.full_name_ar,
          u.email,
          u.phone,
          u.avatar_url,
          e.department,
          e.department_ar,
          e.job_title,
          e.job_title_ar,
          e.employment_type,
          e.employment_status,
          e.join_date,
          COALESCE(s.total_salary, 0) as current_salary,
          COALESCE(s.insurance_commission_rate, 0) as commission_rate,
          COALESCE(comm.total, 0) as total_commissions,
          COALESCE(lb.annual_leave_remaining, 0) as leave_balance,
          95 as attendance_rate
        FROM hr_employees e
        INNER JOIN users u ON e.user_id = u.id
        LEFT JOIN LATERAL (
          SELECT total_salary, insurance_commission_rate
          FROM hr_salaries
          WHERE employee_id = e.id
          ORDER BY effective_date DESC
          LIMIT 1
        ) s ON true
        LEFT JOIN (
          SELECT employee_id, SUM(amount) as total
          FROM hr_commissions
          WHERE payment_status = 'paid'
          GROUP BY employee_id
        ) comm ON comm.employee_id = e.id
        LEFT JOIN (
          SELECT employee_id, annual_leave_remaining
          FROM hr_leave_balance
          WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)
        ) lb ON lb.employee_id = e.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (status && status !== 'all') {
        queryText += ` AND e.employment_status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (department && department !== 'all') {
        queryText += ` AND e.department = $${paramIndex}`;
        params.push(department);
        paramIndex++;
      }

      if (search) {
        queryText += ` AND (
          u.full_name ILIKE $${paramIndex} OR
          u.full_name_ar ILIKE $${paramIndex} OR
          u.email ILIKE $${paramIndex} OR
          e.employee_code ILIKE $${paramIndex}
        )`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      queryText += ' ORDER BY e.join_date DESC';

      const result = await dbQuery(queryText, params);

      return NextResponse.json({ employees: result.rows });
    } catch (error) {
      console.error('Error getting HR employees:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in HR employees GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hr/employees
 * Create new HR employee record
 */
export async function POST(request: NextRequest) {
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
    const {
      user_id,
      employee_code,
      department,
      department_ar,
      job_title,
      job_title_ar,
      employment_type,
      join_date,
      basic_salary,
      housing_allowance,
      transportation_allowance,
      food_allowance,
      insurance_commission_rate,
      national_id,
      passport_number,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
    } = body;

    if (!user_id || !employee_code || !join_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      // Create employee record
      const employeeResult = await dbQuery(
        `INSERT INTO hr_employees (
          user_id, employee_code, department, department_ar, 
          job_title, job_title_ar, employment_type, employment_status,
          join_date, national_id, passport_number,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $9, $10, $11, $12, $13, $14)
        RETURNING id`,
        [
          user_id,
          employee_code,
          department,
          department_ar,
          job_title,
          job_title_ar,
          employment_type || 'full-time',
          join_date,
          national_id || null,
          passport_number || null,
          emergency_contact_name || null,
          emergency_contact_phone || null,
          emergency_contact_relation || null,
          payload.userId,
        ]
      );

      const employeeId = employeeResult.rows[0].id;

      // Create initial salary record if provided
      if (basic_salary) {
        await dbQuery(
          `INSERT INTO hr_salaries (
            employee_id, effective_date, basic_salary,
            housing_allowance, transportation_allowance, food_allowance,
            insurance_commission_rate, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            employeeId,
            join_date,
            basic_salary,
            housing_allowance || 0,
            transportation_allowance || 0,
            food_allowance || 0,
            insurance_commission_rate || 0,
            payload.userId,
          ]
        );
      }

      // Create leave balance for current year
      const currentYear = new Date().getFullYear();
      await dbQuery(
        `INSERT INTO hr_leave_balance (employee_id, year)
         VALUES ($1, $2)`,
        [employeeId, currentYear]
      );

      return NextResponse.json({
        message: 'Employee created successfully',
        id: employeeId,
      });
    } catch (error) {
      console.error('Error creating HR employee:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in HR employees POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
