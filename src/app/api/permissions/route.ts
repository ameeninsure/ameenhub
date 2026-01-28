/**
 * Permissions API Routes
 * GET /api/permissions - List all permissions
 * POST /api/permissions - Create a new permission
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllPermissions, getPermissionsByModule, createPermission } from "@/lib/permissions";
import type { CreatePermissionInput, ApiResponse, Permission, PermissionsByModule, PermissionCategory } from "@/lib/permissions";

// GET /api/permissions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("activeOnly") !== "false";
    const groupByModule = searchParams.get("groupByModule") === "true";

    if (groupByModule) {
      const grouped = await getPermissionsByModule(activeOnly);
      const response: ApiResponse<PermissionsByModule[]> = {
        success: true,
        data: grouped,
      };
      return NextResponse.json(response);
    }

    const permissions = await getAllPermissions(activeOnly);

    const response: ApiResponse<Permission[]> = {
      success: true,
      data: permissions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to fetch permissions",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/permissions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["code", "module", "category", "name_en", "name_ar"];
    for (const field of requiredFields) {
      if (!body[field]) {
        const response: ApiResponse<null> = {
          success: false,
          error: `Missing required field: ${field}`,
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Validate code format
    const codeRegex = /^[a-z0-9_.]+$/;
    if (!codeRegex.test(body.code)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Permission code must contain only lowercase letters, numbers, underscores, and dots",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate category
    const validCategories: PermissionCategory[] = ["page", "api", "button", "menu", "feature"];
    if (!validCategories.includes(body.category)) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const input: CreatePermissionInput = {
      code: body.code,
      module: body.module,
      category: body.category,
      name_en: body.name_en,
      name_ar: body.name_ar,
      description_en: body.description_en,
      description_ar: body.description_ar,
    };

    const permission = await createPermission(input);

    const response: ApiResponse<Permission> = {
      success: true,
      data: permission,
      message: "Permission created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating permission:", error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes("duplicate key")) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Permission code already exists",
      };
      return NextResponse.json(response, { status: 409 });
    }

    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to create permission",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
