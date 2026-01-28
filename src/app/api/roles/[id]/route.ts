/**
 * Single Role API Routes
 * GET /api/roles/[id] - Get role by ID (with permissions)
 * PUT /api/roles/[id] - Update role
 * DELETE /api/roles/[id] - Delete role
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getRoleById,
  getRoleWithPermissions,
  updateRole,
  deleteRole,
} from "@/lib/permissions";
import type { ApiResponse, Role, RoleWithPermissions, UpdateRoleInput } from "@/lib/permissions";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/roles/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const searchParams = request.nextUrl.searchParams;
    const includePermissions = searchParams.get("includePermissions") === "true";

    let role: Role | RoleWithPermissions | null;

    if (includePermissions) {
      role = await getRoleWithPermissions(roleId);
    } else {
      role = await getRoleById(roleId);
    }

    if (!role) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Role not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Role | RoleWithPermissions> = {
      success: true,
      data: role,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching role:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to fetch role",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/roles/[id]
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

    const input: UpdateRoleInput = {
      name_en: body.name_en,
      name_ar: body.name_ar,
      description_en: body.description_en,
      description_ar: body.description_ar,
      is_active: body.is_active,
    };

    const role = await updateRole(roleId, input);

    if (!role) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Role not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Role> = {
      success: true,
      data: role,
      message: "Role updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating role:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to update role",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/roles/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

    const deleted = await deleteRole(roleId);

    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Role not found or cannot be deleted (system role)",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<null> = {
      success: true,
      message: "Role deleted successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error deleting role:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to delete role",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
