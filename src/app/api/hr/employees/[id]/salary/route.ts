import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { userHasPermission } from '@/lib/permissions/queries';
import { query } from '@/db';

/**
 * GET /api/hr/employees/[id]/salary
 * Get salary history for an employee
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

    // Get salary history
    const salaryResult = await query(`
      SELECT * FROM hr_salaries
      WHERE employee_id = $1
      ORDER BY effective_date DESC
    `, [employeeId]);

    return NextResponse.json({
      success: true,
      data: salaryResult.rows,
    });
  } catch (error) {
    console.error('Error fetching salary history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hr/employees/[id]/salary
 * Create or update salary record for an employee
 */
export async function POST(
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
    const {
      basic_salary,
      housing_allowance,
      transportation_allowance,
      food_allowance,
      other_allowances,
      insurance_commission_rate,
      effective_date,
    } = body;

    // Check if there's an existing salary record for this effective date
    const existingResult = await query(
      `SELECT id FROM hr_salaries WHERE employee_id = $1 AND effective_date = $2`,
      [employeeId, effective_date]
    );

    if (existingResult.rows.length > 0) {
      // Update existing record
      await query(`
        UPDATE hr_salaries SET
          basic_salary = $1,
          housing_allowance = $2,
          transportation_allowance = $3,
          food_allowance = $4,
          other_allowances = $5,
          insurance_commission_rate = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = $7 AND effective_date = $8
      `, [
        basic_salary || 0,
        housing_allowance || 0,
        transportation_allowance || 0,
        food_allowance || 0,
        other_allowances || 0,
        insurance_commission_rate || 0,
        employeeId,
        effective_date,
      ]);
    } else {
      // Insert new record (total_salary is a generated column)
      await query(`
        INSERT INTO hr_salaries (
          employee_id,
          basic_salary,
          housing_allowance,
          transportation_allowance,
          food_allowance,
          other_allowances,
          insurance_commission_rate,
          effective_date,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        employeeId,
        basic_salary || 0,
        housing_allowance || 0,
        transportation_allowance || 0,
        food_allowance || 0,
        other_allowances || 0,
        insurance_commission_rate || 0,
        effective_date,
        payload.userId,
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Salary saved successfully',
    });
  } catch (error) {
    console.error('Error saving salary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
