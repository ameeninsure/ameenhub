/**
 * Role Permissions API Routes
 * GET /api/roles/[id]/permissions - Get role permissions
 * PUT /api/roles/[id]/permissions - Set role permissions (replace all)
 * POST /api/roles/[id]/permissions - Add a permission to role
 * DELETE /api/roles/[id]/permissions - Remove a permission from role
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getRoleWithPermissions,
  setRolePermissions,
  assignPermissionToRole,
  removePermissionFromRole,
  getRoleById,
} from "@/lib/permissions";
import type { ApiResponse, Permission, RoleWithPermissions } from "@/lib/permissions";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/roles/[id]/permissions
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const roleId = parseInt(id, 10);

    if (isNaN(roleId)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid role ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const roleWithPermissions = await getRoleWithPermissions(roleId);

    if (!roleWithPermissions) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Role not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Permission[]> = {
      success: true,
      data: roleWithPermissions.permissions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to fetch role permissions",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/roles/[id]/permissions - Replace all permissions
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const roleId = parseInt(id, 10);

    if (isNaN(roleId)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid role ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();

    if (!Array.isArray(body.permissionIds)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "permissionIds must be an array",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if role exists
    const role = await getRoleById(roleId);
    if (!role) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Role not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // TODO: Get granted_by from authenticated user
    const grantedBy = body.grantedBy || null;

    await setRolePermissions(roleId, body.permissionIds, grantedBy);

    const roleWithPermissions = await getRoleWithPermissions(roleId);

    const response: ApiResponse<RoleWithPermissions | null> = {
      success: true,
      data: roleWithPermissions,
      message: "Role permissions updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error setting role permissions:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to set role permissions",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/roles/[id]/permissions - Add a permission
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const roleId = parseInt(id, 10);

    if (isNaN(roleId)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid role ID",
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

    // Check if role exists
    const role = await getRoleById(roleId);
    if (!role) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Role not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // TODO: Get granted_by from authenticated user
    const grantedBy = body.grantedBy || null;

    await assignPermissionToRole(roleId, body.permissionId, grantedBy);

    const roleWithPermissions = await getRoleWithPermissions(roleId);

    const response: ApiResponse<RoleWithPermissions | null> = {
      success: true,
      data: roleWithPermissions,
      message: "Permission assigned successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error assigning permission:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to assign permission",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/roles/[id]/permissions - Remove a permission
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const roleId = parseInt(id, 10);

    if (isNaN(roleId)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid role ID",
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

    const removed = await removePermissionFromRole(roleId, body.permissionId);

    if (!removed) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Permission assignment not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const roleWithPermissions = await getRoleWithPermissions(roleId);

    const response: ApiResponse<RoleWithPermissions | null> = {
      success: true,
      data: roleWithPermissions,
      message: "Permission removed successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error removing permission:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to remove permission",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
