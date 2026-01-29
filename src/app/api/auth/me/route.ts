/**
 * Auth API Route - Get Current User
 * GET /api/auth/me
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/db';

export async function GET() {
  try {
    // Get current user from token
    const tokenPayload = await getCurrentUser();

    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const result = await pool.query(
      `SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.full_name, 
        u.avatar_url,
        u.phone,
        u.preferred_language,
        u.is_active,
        u.created_at,
        u.last_login_at,
        ARRAY_AGG(r.code) FILTER (WHERE r.code IS NOT NULL) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      GROUP BY u.id`,
      [tokenPayload.userId]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: 'Account is disabled' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        phone: user.phone,
        preferred_language: user.preferred_language,
        roles: user.roles || [],
        created_at: user.created_at,
        last_login_at: user.last_login_at,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
