/**
 * Auth API Route - Login
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/db';
import { generateTokens, setAuthCookies, comparePassword, AuthUser } from '@/lib/auth';

interface LoginRequest {
  username?: string;  // Can be username, email, or phone
  identifier?: string; // Alternative field name for username/email/phone
  password: string;
  remember?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    // Support both 'username' and 'identifier' field names
    const identifier = body.identifier || body.username;
    const { password } = body;

    // Validate input
    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Username/email/phone and password are required' },
        { status: 400 }
      );
    }

    // Find user by username, email, or phone
    const result = await pool.query(
      `SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.password_hash, 
        u.full_name, 
        u.avatar_url,
        u.phone,
        u.is_active,
        ARRAY_AGG(r.code) FILTER (WHERE r.code IS NOT NULL) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE (u.username = $1 OR u.email = $1 OR u.phone = $1)
      GROUP BY u.id`,
      [identifier]
    );

    const user = result.rows[0];

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: 'Account is disabled. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
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

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(authUser);

    // Set cookies
    await setAuthCookies(accessToken, refreshToken);

    // Update last login
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Return user data (without sensitive info)
    return NextResponse.json({
      success: true,
      data: {
        user: authUser,
        accessToken, // Also return token for client-side storage if needed
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
