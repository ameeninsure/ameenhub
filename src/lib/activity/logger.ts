/**
 * Activity Logging Middleware
 * Automatically logs all user activities with full details
 */

import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/db';

interface ActivityLogData {
  userId: number;
  action: string;
  module: string;
  entityType?: string;
  entityId?: number;
  method: string;
  endpoint: string;
  statusCode: number;
  description: string;
  descriptionAr: string;
  oldValues?: any;
  newValues?: any;
  changes?: any;
  metadata?: any;
  ipAddress: string;
  userAgent: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  country?: string;
  city?: string;
  referrer?: string;
  durationMs?: number;
  isSuspicious?: boolean;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Parse user agent to extract browser and OS
 */
function parseUserAgent(userAgent: string): { browser: string; os: string; deviceType: string } {
  const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/?([\d.]+)/)?.[1] || 'Unknown';
  let os = 'Unknown';
  let deviceType = 'desktop';

  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS X')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) {
    os = 'Android';
    deviceType = 'mobile';
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
    deviceType = userAgent.includes('iPad') ? 'tablet' : 'mobile';
  }

  if (userAgent.includes('Mobile') && deviceType === 'desktop') {
    deviceType = 'mobile';
  } else if (userAgent.includes('Tablet')) {
    deviceType = 'tablet';
  }

  return { browser, os, deviceType };
}

/**
 * Log user activity to database
 */
export async function logActivity(data: ActivityLogData): Promise<void> {
  try {
    const {
      userId,
      action,
      module,
      entityType,
      entityId,
      method,
      endpoint,
      statusCode,
      description,
      descriptionAr,
      oldValues,
      newValues,
      changes,
      metadata,
      ipAddress,
      userAgent,
      browser,
      os,
      deviceType,
      country,
      city,
      referrer,
      durationMs,
      isSuspicious = false,
      riskLevel = 'low',
    } = data;

    await query(
      `INSERT INTO user_activity_logs (
        user_id, action, module, entity_type, entity_id,
        method, endpoint, status_code,
        description, description_ar,
        old_values, new_values, changes, metadata,
        ip_address, user_agent, browser, os, device_type,
        country, city, referrer, duration_ms,
        is_suspicious, risk_level
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10,
        $11, $12, $13, $14,
        $15, $16, $17, $18, $19,
        $20, $21, $22, $23,
        $24, $25
      )`,
      [
        userId,
        action,
        module,
        entityType || null,
        entityId || null,
        method,
        endpoint,
        statusCode,
        description,
        descriptionAr,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        changes ? JSON.stringify(changes) : null,
        metadata ? JSON.stringify(metadata) : null,
        ipAddress,
        userAgent,
        browser || null,
        os || null,
        deviceType || null,
        country || null,
        city || null,
        referrer || null,
        durationMs || null,
        isSuspicious,
        riskLevel,
      ]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - we don't want logging failures to break the app
  }
}

/**
 * Create activity log from Next.js request
 */
export async function logRequestActivity(
  request: NextRequest,
  action: string,
  module: string,
  description: string,
  descriptionAr: string,
  options: {
    entityType?: string;
    entityId?: number;
    statusCode?: number;
    oldValues?: any;
    newValues?: any;
    changes?: any;
    metadata?: any;
    durationMs?: number;
    isSuspicious?: boolean;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  } = {}
): Promise<void> {
  try {
    // Get user from token
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return;

    const payload = await verifyToken(token);
    if (!payload) return;

    // Extract request information
    const method = request.method;
    const endpoint = request.nextUrl.pathname;
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const referrer = request.headers.get('referer') || request.headers.get('referrer') || undefined;
    
    // Parse user agent
    const { browser, os, deviceType } = parseUserAgent(userAgent);

    // Log the activity
    await logActivity({
      userId: payload.userId,
      action,
      module,
      entityType: options.entityType,
      entityId: options.entityId,
      method,
      endpoint,
      statusCode: options.statusCode || 200,
      description,
      descriptionAr,
      oldValues: options.oldValues,
      newValues: options.newValues,
      changes: options.changes,
      metadata: options.metadata,
      ipAddress,
      userAgent,
      browser,
      os,
      deviceType,
      referrer,
      durationMs: options.durationMs,
      isSuspicious: options.isSuspicious,
      riskLevel: options.riskLevel,
    });
  } catch (error) {
    console.error('Error in logRequestActivity:', error);
  }
}

/**
 * Helper to calculate changes between old and new values
 */
export function calculateChanges(oldValues: any, newValues: any): any {
  const changes: any = {};
  
  if (!oldValues || !newValues) return changes;

  // Get all keys from both objects
  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

  allKeys.forEach((key) => {
    const oldVal = oldValues[key];
    const newVal = newValues[key];

    // Skip if values are the same
    if (JSON.stringify(oldVal) === JSON.stringify(newVal)) return;

    changes[key] = {
      old: oldVal,
      new: newVal,
    };
  });

  return changes;
}

/**
 * Detect suspicious activity patterns
 */
export function detectSuspiciousActivity(
  userId: number,
  action: string,
  ipAddress: string,
  metadata?: any
): { isSuspicious: boolean; riskLevel: 'low' | 'medium' | 'high' | 'critical' } {
  let isSuspicious = false;
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  // Check for rapid login attempts
  if (action === 'login_failed' && metadata?.failedAttempts > 3) {
    isSuspicious = true;
    riskLevel = metadata.failedAttempts > 5 ? 'critical' : 'high';
  }

  // Check for data deletion
  if (action === 'delete' || action === 'bulk_delete') {
    riskLevel = 'medium';
  }

  // Check for permission changes
  if (action === 'update_permissions' || action === 'update_role') {
    riskLevel = 'medium';
  }

  // Check for unusual IP address (this would require historical data)
  // For now, just flag it as low risk
  if (metadata?.unusualIP) {
    isSuspicious = true;
    riskLevel = 'medium';
  }

  return { isSuspicious, riskLevel };
}
