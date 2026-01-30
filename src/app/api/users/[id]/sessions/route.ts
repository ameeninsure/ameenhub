import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/db';

/**
 * GET /api/users/[id]/sessions
 * Get user's active sessions
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

    const result = await query(
      `SELECT 
        s.id,
        s.session_token,
        s.device_id,
        s.ip_address,
        s.user_agent,
        s.browser,
        s.os,
        s.country,
        s.city,
        s.is_active,
        s.last_activity_at,
        s.expires_at,
        s.created_at,
        d.device_name,
        d.device_type,
        d.device_model
      FROM user_sessions s
      LEFT JOIN user_devices d ON s.device_id = d.id
      WHERE s.user_id = $1
      ORDER BY s.last_activity_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      sessions: result.rows,
    });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]/sessions/[sessionId]
 * Terminate a specific session
 */
export async function DELETE(
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
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Update session to inactive
    await query(
      `UPDATE user_sessions SET is_active = false, updated_at = NOW() WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    // Log the action
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await query(
      `INSERT INTO user_activity_logs 
        (user_id, action, module, description, description_ar, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        payload.userId,
        'session_terminated',
        'security',
        `Terminated session for user ${userId}`,
        `إنهاء الجلسة للمستخدم ${userId}`,
        ip,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Session terminated successfully',
    });
  } catch (error) {
    console.error('Error terminating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
