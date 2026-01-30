import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { userHasPermission } from '@/lib/permissions/queries';
import { query as dbQuery } from '@/db';

/**
 * GET /api/hr/employees/[id]/performance
 * Get performance reviews for an employee
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
        p.id,
        p.review_date,
        p.review_period_start,
        p.review_period_end,
        p.overall_rating,
        p.strengths,
        p.areas_for_improvement,
        p.goals,
        p.achievements,
        p.comments,
        p.status,
        p.acknowledged_date,
        u.full_name as reviewer_name
      FROM hr_performance_reviews p
      LEFT JOIN users u ON p.reviewer_id = u.id
      WHERE p.employee_id = $1
      ORDER BY p.review_date DESC`,
      [id]
    );

    // Calculate average rating
    const avgResult = await dbQuery(
      `SELECT AVG(overall_rating) as avg_rating, COUNT(*) as total_reviews
       FROM hr_performance_reviews
       WHERE employee_id = $1 AND status = 'completed'`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        reviews: result.rows,
        summary: {
          averageRating: avgResult.rows[0]?.avg_rating ? parseFloat(avgResult.rows[0].avg_rating).toFixed(2) : null,
          totalReviews: parseInt(avgResult.rows[0]?.total_reviews || '0'),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching performance reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hr/employees/[id]/performance
 * Add a new performance review
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
    const {
      review_date,
      review_period_start,
      review_period_end,
      overall_rating,
      strengths,
      areas_for_improvement,
      goals,
      achievements,
      comments,
      status,
    } = body;

    if (!review_date || !review_period_start || !review_period_end) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await dbQuery(
      `INSERT INTO hr_performance_reviews (
        employee_id, review_date, review_period_start, review_period_end,
        reviewer_id, overall_rating, strengths, areas_for_improvement,
        goals, achievements, comments, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id`,
      [
        id,
        review_date,
        review_period_start,
        review_period_end,
        payload.userId,
        overall_rating || null,
        strengths || null,
        areas_for_improvement || null,
        goals || null,
        achievements || null,
        comments || null,
        status || 'draft',
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Error creating performance review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/hr/employees/[id]/performance
 * Update a performance review
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
    const {
      review_id,
      overall_rating,
      strengths,
      areas_for_improvement,
      goals,
      achievements,
      comments,
      status,
    } = body;

    if (!review_id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    await dbQuery(
      `UPDATE hr_performance_reviews 
       SET overall_rating = $1,
           strengths = $2,
           areas_for_improvement = $3,
           goals = $4,
           achievements = $5,
           comments = $6,
           status = $7,
           acknowledged_date = CASE WHEN $7 = 'acknowledged' THEN CURRENT_TIMESTAMP ELSE acknowledged_date END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8`,
      [
        overall_rating,
        strengths,
        areas_for_improvement,
        goals,
        achievements,
        comments,
        status || 'draft',
        review_id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating performance review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
