/**
 * Auth API Route - Logout
 * POST /api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies, verifyToken } from '@/lib/auth';
import pool from '@/db';

export async function POST(request: NextRequest) {
  try {
    // Get token before clearing
    const token = request.cookies.get('auth_token')?.value;
    
    if (token) {
      try {
        const payload = await verifyToken(token);
        
        if (payload) {
          // Deactivate session
          await pool.query(
            `UPDATE user_sessions 
             SET is_active = FALSE, updated_at = NOW() 
             WHERE session_token = $1 AND user_id = $2`,
            [token, payload.userId]
          );

          // Log logout activity
          const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
          const userAgent = request.headers.get('user-agent') || 'Unknown';
          
          await pool.query(
            `INSERT INTO user_activity_logs (
              user_id, action, module, description, description_ar,
              method, endpoint, status_code, ip_address, user_agent
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              payload.userId,
              'logout',
              'auth',
              'User logged out',
              'تسجيل خروج المستخدم',
              'POST',
              '/api/auth/logout',
              200,
              ip,
              userAgent,
            ]
          );
        }
      } catch (error) {
        console.error('Error processing logout:', error);
        // Continue with logout even if session update fails
      }
    }

    // Clear auth cookies
    await clearAuthCookies();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
