/**
 * User Permissions API Routes
 * GET /api/users/[id]/permissions - Get user permissions
 * POST /api/users/[id]/permissions - Add custom permission
 * DELETE /api/users/[id]/permissions - Remove custom permission
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getUserWithPermissions,
  getUserCustomPermissions,
  assignCustomPermissionToUser,
  removeCustomPermissionFromUser,
  getSafeUserById,
} from "@/lib/permissions";
import type { ApiResponse, UserWithPermissions, UserCustomPermission, Permission } from "@/lib/permissions";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/users/[id]/permissions
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid user ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const customOnly = searchParams.get("customOnly") === "true";

    if (customOnly) {
      // Get only custom permissions
      const customPermissions = await getUserCustomPermissions(userId);
      const response: ApiResponse<(UserCustomPermission & { permission: Permission })[]> = {
        success: true,
        data: customPermissions,
      };
      return NextResponse.json(response);
    }

    // Get all permissions (from roles + custom)
    const user = await getUserWithPermissions(userId);

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<UserWithPermissions> = {
      success: true,
      data: user,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to fetch user permissions",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/users/[id]/permissions - Add custom permission
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid user ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();

    if (!body.permissionId) {
      const response: ApiResponse<null> = {
        success: false,
        error: "permissionId is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if user exists
    const user = await getSafeUserById(userId);
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // isGranted defaults to true (grant permission)
    // Set to false to explicitly deny a permission
    const isGranted = body.isGranted !== false;

    // TODO: Get assigned_by from authenticated user
    const assignedBy = body.assignedBy || null;

    const customPermission = await assignCustomPermissionToUser(
      userId,
      body.permissionId,
      isGranted,
      assignedBy
    );

    const response: ApiResponse<UserCustomPermission | null> = {
      success: true,
      data: customPermission,
      message: isGranted ? "Permission granted successfully" : "Permission denied successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error assigning custom permission:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to assign custom permission",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/users/[id]/permissions - Remove custom permission
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid user ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();

    if (!body.permissionId) {
      const response: ApiResponse<null> = {
        success: false,
        error: "permissionId is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const removed = await removeCustomPermissionFromUser(userId, body.permissionId);

    if (!removed) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Custom permission not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<null> = {
      success: true,
      message: "Custom permission removed successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error removing custom permission:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to remove custom permission",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
