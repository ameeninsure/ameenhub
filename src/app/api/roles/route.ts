/**
 * Roles API Routes
 * GET /api/roles - List all roles
 * POST /api/roles - Create a new role
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllRoles, createRole } from "@/lib/permissions";
import type { CreateRoleInput, ApiResponse, Role } from "@/lib/permissions";

// GET /api/roles
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const roles = await getAllRoles(activeOnly);

    const response: ApiResponse<Role[]> = {
      success: true,
      data: roles,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching roles:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to fetch roles",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/roles
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["code", "name_en", "name_ar"];
    for (const field of requiredFields) {
      if (!body[field]) {
        const response: ApiResponse<null> = {
          success: false,
          error: `Missing required field: ${field}`,
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Validate code format (alphanumeric and underscores only)
    const codeRegex = /^[a-z0-9_]+$/;
    if (!codeRegex.test(body.code)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Role code must contain only lowercase letters, numbers, and underscores",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const input: CreateRoleInput = {
      code: body.code,
      name_en: body.name_en,
      name_ar: body.name_ar,
      description_en: body.description_en,
      description_ar: body.description_ar,
    };

    const role = await createRole(input);

    const response: ApiResponse<Role> = {
      success: true,
      data: role,
      message: "Role created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating role:", error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes("duplicate key")) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Role code already exists",
      };
      return NextResponse.json(response, { status: 409 });
    }

    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to create role",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
