/**
 * Auth API Route - Refresh Token
 * POST /api/auth/refresh
 */

import { NextResponse } from 'next/server';
import { getRefreshToken, verifyToken, generateTokens, setAuthCookies, AuthUser } from '@/lib/auth';
import pool from '@/db';

export async function POST() {
  try {
    // Get refresh token from cookies
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = await verifyToken(refreshToken);

    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json(
        { success: false, error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Get user from database to ensure they still exist and are active
    const result = await pool.query(
      `SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.full_name, 
        u.avatar_url,
        u.is_active,
        ARRAY_AGG(r.code) FILTER (WHERE r.code IS NOT NULL) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      GROUP BY u.id`,
      [payload.userId]
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

    // Create auth user object
    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      roles: user.roles || [],
    };

    // Generate new tokens
    const tokens = await generateTokens(authUser);

    // Set new cookies
    await setAuthCookies(tokens.accessToken, tokens.refreshToken);

    return NextResponse.json({
      success: true,
      data: {
        user: authUser,
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
