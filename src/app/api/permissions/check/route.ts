/**
 * Check Permission API
 * POST /api/permissions/check - Check if user has permission(s)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  userHasPermission,
  userHasAnyPermission,
  userHasAllPermissions,
} from "@/lib/permissions";
import type { ApiResponse } from "@/lib/permissions";

interface CheckPermissionResult {
  hasPermission: boolean;
  permissions?: Record<string, boolean>;
}

// POST /api/permissions/check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: "userId is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const userId = parseInt(body.userId, 10);
    if (isNaN(userId)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid userId",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Single permission check
    if (body.permission && typeof body.permission === "string") {
      const hasPermission = await userHasPermission(userId, body.permission);
      const response: ApiResponse<CheckPermissionResult> = {
        success: true,
        data: { hasPermission },
      };
      return NextResponse.json(response);
    }

    // Multiple permission check
    if (body.permissions && Array.isArray(body.permissions)) {
      const mode = body.mode || "any"; // "any" or "all"

      let hasPermission: boolean;
      if (mode === "all") {
        hasPermission = await userHasAllPermissions(userId, body.permissions);
      } else {
        hasPermission = await userHasAnyPermission(userId, body.permissions);
      }

      // Also return individual permission results
      const permissions: Record<string, boolean> = {};
      for (const perm of body.permissions) {
        permissions[perm] = await userHasPermission(userId, perm);
      }

      const response: ApiResponse<CheckPermissionResult> = {
        success: true,
        data: {
          hasPermission,
          permissions,
        },
      };
      return NextResponse.json(response);
    }

    const response: ApiResponse<null> = {
      success: false,
      error: "Either permission (string) or permissions (array) is required",
    };
    return NextResponse.json(response, { status: 400 });
  } catch (error) {
    console.error("Error checking permission:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to check permission",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
