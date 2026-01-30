import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/db';

/**
 * GET /api/users/[id]/devices
 * Get user's registered devices
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

    // Get user devices
    const result = await query(
      `SELECT 
        id,
        device_type,
        device_name,
        browser,
        browser_version,
        os,
        os_version,
        device_model,
        ip_address,
        country,
        city,
        is_active,
        last_used_at,
        created_at
      FROM user_devices
      WHERE user_id = $1
      ORDER BY last_used_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      devices: result.rows,
    });
  } catch (error) {
    console.error('Error fetching user devices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]/devices?deviceId=123
 * Remove a device from user's registered devices
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
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID required' },
        { status: 400 }
      );
    }

    // Delete device
    await query(
      `DELETE FROM user_devices 
       WHERE id = $1 AND user_id = $2`,
      [deviceId, userId]
    );

    // Log activity
    await query(
      `INSERT INTO user_activity_logs (
        user_id, action, module, entity_type, entity_id,
        method, endpoint, status_code, description, description_ar,
        ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        payload.userId,
        'delete',
        'users',
        'device',
        deviceId,
        'DELETE',
        `/api/users/${userId}/devices`,
        200,
        `Removed device ${deviceId}`,
        `تم حذف الجهاز ${deviceId}`,
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Device removed successfully',
    });
  } catch (error) {
    console.error('Error removing device:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
