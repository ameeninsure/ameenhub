/**
 * Session Management Utilities
 * Handle user sessions and activity tracking
 */

import { NextRequest } from 'next/server';
import pool from '@/db';
import { verifyToken } from './index';

/**
 * Update session last activity timestamp
 */
export async function updateSessionActivity(sessionToken: string): Promise<void> {
  try {
    await pool.query(
      `UPDATE user_sessions 
       SET last_activity_at = NOW() 
       WHERE session_token = $1 AND is_active = TRUE`,
      [sessionToken]
    );
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
}

/**
 * Create a new session
 */
export async function createSession(
  userId: number,
  sessionToken: string,
  request: NextRequest,
  deviceId?: number
): Promise<void> {
  try {
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Parse user agent
    const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/?([\d.]+)/)?.[1] || 'Unknown';
    let os = 'Unknown';
    
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS X')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    await pool.query(
      `INSERT INTO user_sessions (
        user_id, device_id, session_token, ip_address, user_agent,
        browser, os, is_active, last_activity_at, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, NOW(), NOW() + INTERVAL '7 days')
      ON CONFLICT (session_token) DO UPDATE SET
        last_activity_at = NOW(),
        is_active = TRUE`,
      [userId, deviceId, sessionToken, ip, userAgent, browser, os]
    );
  } catch (error) {
    console.error('Error creating session:', error);
  }
}

/**
 * Terminate a session
 */
export async function terminateSession(sessionToken: string, userId?: number): Promise<void> {
  try {
    const query = userId
      ? `UPDATE user_sessions SET is_active = FALSE, updated_at = NOW() 
         WHERE session_token = $1 AND user_id = $2`
      : `UPDATE user_sessions SET is_active = FALSE, updated_at = NOW() 
         WHERE session_token = $1`;
    
    const params = userId ? [sessionToken, userId] : [sessionToken];
    
    await pool.query(query, params);
  } catch (error) {
    console.error('Error terminating session:', error);
  }
}

/**
 * Get active sessions for a user
 */
export async function getUserActiveSessions(userId: number): Promise<any[]> {
  try {
    const result = await pool.query(
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
      WHERE s.user_id = $1 AND s.is_active = TRUE
      ORDER BY s.last_activity_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await pool.query(
      `UPDATE user_sessions 
       SET is_active = FALSE, updated_at = NOW()
       WHERE is_active = TRUE AND expires_at < NOW()
       RETURNING id`
    );
    return result.rowCount || 0;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    return 0;
  }
}
