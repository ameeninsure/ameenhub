import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/db';

/**
 * GET /api/users/[id]/activity
 * Get user's activity logs
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const { id } = await context.params;
    const userId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action');
    const module = searchParams.get('module');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const offset = (page - 1) * limit;

    // Build query
    let queryText = `
      SELECT 
        id,
        action,
        module,
        entity_type,
        entity_id,
        method,
        endpoint,
        status_code,
        description,
        description_ar,
        ip_address,
        user_agent,
        browser,
        os,
        device_type,
        country,
        city,
        duration_ms,
        is_suspicious,
        risk_level,
        created_at
      FROM user_activity_logs
      WHERE user_id = $1
    `;

    const params_array: any[] = [userId];
    let paramIndex = 2;

    if (action) {
      queryText += ` AND action = $${paramIndex}`;
      params_array.push(action);
      paramIndex++;
    }

    if (module) {
      queryText += ` AND module = $${paramIndex}`;
      params_array.push(module);
      paramIndex++;
    }

    if (startDate) {
      queryText += ` AND created_at >= $${paramIndex}`;
      params_array.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryText += ` AND created_at <= $${paramIndex}`;
      params_array.push(endDate);
      paramIndex++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params_array.push(limit, offset);

    const result = await query(queryText, params_array);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM user_activity_logs WHERE user_id = $1`;
    const countParams: any[] = [userId];
    let countParamIndex = 2;

    if (action) {
      countQuery += ` AND action = $${countParamIndex}`;
      countParams.push(action);
      countParamIndex++;
    }

    if (module) {
      countQuery += ` AND module = $${countParamIndex}`;
      countParams.push(module);
      countParamIndex++;
    }

    if (startDate) {
      countQuery += ` AND created_at >= $${countParamIndex}`;
      countParams.push(startDate);
      countParamIndex++;
    }

    if (endDate) {
      countQuery += ` AND created_at <= $${countParamIndex}`;
      countParams.push(endDate);
      countParamIndex++;
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Get activity summary
    const summaryResult = await query(
      `SELECT * FROM get_user_activity_summary($1, 30)`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      activities: result.rows,
      summary: summaryResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
