/**
 * API Permission Middleware
 * Utility functions for checking permissions in API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { userHasPermission, userHasAnyPermission, userHasAllPermissions } from "./queries";
import type { ApiResponse } from "./types";

/**
 * Extract user ID from request (from session, JWT, etc.)
 * This is a placeholder - implement based on your authentication system
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<number | null> {
  // TODO: Implement based on your auth system
  // Examples:
  // - Check session cookie
  // - Verify JWT token
  // - Check API key
  
  // For now, check for a user-id header (for testing)
  const userIdHeader = request.headers.get("x-user-id");
  if (userIdHeader) {
    const userId = parseInt(userIdHeader, 10);
    if (!isNaN(userId)) {
      return userId;
    }
  }
  
  return null;
}

/**
 * Check if the request has the required permission
 */
export async function checkPermission(
  request: NextRequest,
  permission: string
): Promise<{ authorized: boolean; userId: number | null }> {
  const userId = await getUserIdFromRequest(request);
  
  if (!userId) {
    return { authorized: false, userId: null };
  }
  
  const hasPermission = await userHasPermission(userId, permission);
  return { authorized: hasPermission, userId };
}

/**
 * Check if the request has any of the required permissions
 */
export async function checkAnyPermission(
  request: NextRequest,
  permissions: string[]
): Promise<{ authorized: boolean; userId: number | null }> {
  const userId = await getUserIdFromRequest(request);
  
  if (!userId) {
    return { authorized: false, userId: null };
  }
  
  const hasPermission = await userHasAnyPermission(userId, permissions);
  return { authorized: hasPermission, userId };
}

/**
 * Check if the request has all of the required permissions
 */
export async function checkAllPermissions(
  request: NextRequest,
  permissions: string[]
): Promise<{ authorized: boolean; userId: number | null }> {
  const userId = await getUserIdFromRequest(request);
  
  if (!userId) {
    return { authorized: false, userId: null };
  }
  
  const hasPermission = await userHasAllPermissions(userId, permissions);
  return { authorized: hasPermission, userId };
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  const response: ApiResponse<null> = {
    success: false,
    error: message,
  };
  return NextResponse.json(response, { status: 401 });
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(message = "You do not have permission to perform this action"): NextResponse {
  const response: ApiResponse<null> = {
    success: false,
    error: message,
  };
  return NextResponse.json(response, { status: 403 });
}

/**
 * Require permission middleware wrapper
 * 
 * Usage:
 * export const GET = requirePermission("customers.view", async (request, userId) => {
 *   // Your handler code here
 *   return NextResponse.json({ success: true });
 * });
 */
export function requirePermission(
  permission: string,
  handler: (request: NextRequest, userId: number) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { authorized, userId } = await checkPermission(request, permission);
    
    if (!userId) {
      return unauthorizedResponse();
    }
    
    if (!authorized) {
      return forbiddenResponse();
    }
    
    return handler(request, userId);
  };
}

/**
 * Require any of the permissions middleware wrapper
 */
export function requireAnyPermission(
  permissions: string[],
  handler: (request: NextRequest, userId: number) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { authorized, userId } = await checkAnyPermission(request, permissions);
    
    if (!userId) {
      return unauthorizedResponse();
    }
    
    if (!authorized) {
      return forbiddenResponse();
    }
    
    return handler(request, userId);
  };
}

/**
 * Require all permissions middleware wrapper
 */
export function requireAllPermissions(
  permissions: string[],
  handler: (request: NextRequest, userId: number) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { authorized, userId } = await checkAllPermissions(request, permissions);
    
    if (!userId) {
      return unauthorizedResponse();
    }
    
    if (!authorized) {
      return forbiddenResponse();
    }
    
    return handler(request, userId);
  };
}
