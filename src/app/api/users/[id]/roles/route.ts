/**
 * User Roles API Routes
 * GET /api/users/[id]/roles - Get user roles
 * PUT /api/users/[id]/roles - Set user roles (replace all)
 * POST /api/users/[id]/roles - Add a role to user
 * DELETE /api/users/[id]/roles - Remove a role from user
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getUserRoles,
  setUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
  getSafeUserById,
} from "@/lib/permissions";
import type { ApiResponse, Role } from "@/lib/permissions";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/users/[id]/roles
export async function GET(_request: NextRequest, { params }: RouteParams) {
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

    // Check if user exists
    const user = await getSafeUserById(userId);
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const roles = await getUserRoles(userId);

    const response: ApiResponse<Role[]> = {
      success: true,
      data: roles,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to fetch user roles",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/users/[id]/roles - Replace all roles
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    if (!Array.isArray(body.roleIds)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "roleIds must be an array",
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

    // TODO: Get assigned_by from authenticated user
    const assignedBy = body.assignedBy || null;

    await setUserRoles(userId, body.roleIds, assignedBy);

    const roles = await getUserRoles(userId);

    const response: ApiResponse<Role[]> = {
      success: true,
      data: roles,
      message: "User roles updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error setting user roles:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to set user roles",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/users/[id]/roles - Add a role
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

    if (!body.roleId) {
      const response: ApiResponse<null> = {
        success: false,
        error: "roleId is required",
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

    // TODO: Get assigned_by from authenticated user
    const assignedBy = body.assignedBy || null;

    await assignRoleToUser(userId, body.roleId, assignedBy);

    const roles = await getUserRoles(userId);

    const response: ApiResponse<Role[]> = {
      success: true,
      data: roles,
      message: "Role assigned successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error assigning role:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to assign role",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/users/[id]/roles - Remove a role
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

    if (!body.roleId) {
      const response: ApiResponse<null> = {
        success: false,
        error: "roleId is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const removed = await removeRoleFromUser(userId, body.roleId);

    if (!removed) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Role assignment not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const roles = await getUserRoles(userId);

    const response: ApiResponse<Role[]> = {
      success: true,
      data: roles,
      message: "Role removed successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error removing role:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to remove role",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
