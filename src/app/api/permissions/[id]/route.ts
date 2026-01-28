/**
 * Single Permission API Routes
 * GET /api/permissions/[id] - Get permission by ID
 * PUT /api/permissions/[id] - Update permission
 * DELETE /api/permissions/[id] - Delete permission
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getPermissionById,
  updatePermission,
  deletePermission,
} from "@/lib/permissions";
import type { ApiResponse, Permission, UpdatePermissionInput } from "@/lib/permissions";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/permissions/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const permissionId = parseInt(id, 10);

    if (isNaN(permissionId)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid permission ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const permission = await getPermissionById(permissionId);

    if (!permission) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Permission not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Permission> = {
      success: true,
      data: permission,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching permission:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to fetch permission",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/permissions/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const permissionId = parseInt(id, 10);

    if (isNaN(permissionId)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid permission ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();

    const input: UpdatePermissionInput = {
      name_en: body.name_en,
      name_ar: body.name_ar,
      description_en: body.description_en,
      description_ar: body.description_ar,
      is_active: body.is_active,
    };

    const permission = await updatePermission(permissionId, input);

    if (!permission) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Permission not found or cannot be updated (system permission)",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Permission> = {
      success: true,
      data: permission,
      message: "Permission updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating permission:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to update permission",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/permissions/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const permissionId = parseInt(id, 10);

    if (isNaN(permissionId)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid permission ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const deleted = await deletePermission(permissionId);

    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Permission not found or cannot be deleted (system permission)",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<null> = {
      success: true,
      message: "Permission deleted successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error deleting permission:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to delete permission",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
