/**
 * Single User API Routes
 * GET /api/users/[id] - Get user by ID
 * PUT /api/users/[id] - Update user
 * DELETE /api/users/[id] - Delete user
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSafeUserById,
  getUserWithPermissions,
  updateUser,
  deleteUser,
} from "@/lib/permissions";
import type { ApiResponse, SafeUser, UserWithPermissions, UpdateUserInput } from "@/lib/permissions";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/users/[id]
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
    const includePermissions = searchParams.get("includePermissions") === "true";

    let user: SafeUser | UserWithPermissions | null;

    if (includePermissions) {
      user = await getUserWithPermissions(userId);
    } else {
      user = await getSafeUserById(userId);
    }

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<SafeUser | UserWithPermissions> = {
      success: true,
      data: user,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to fetch user",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/users/[id]
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

    // Validate email format if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Invalid email format",
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    const input: UpdateUserInput = {
      username: body.username,
      email: body.email,
      full_name: body.full_name,
      phone: body.phone,
      avatar_url: body.avatar_url,
      preferred_language: body.preferred_language,
      is_active: body.is_active,
    };

    const user = await updateUser(userId, input);

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<SafeUser> = {
      success: true,
      data: user,
      message: "User updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating user:", error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes("duplicate key")) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Username or email already exists",
      };
      return NextResponse.json(response, { status: 409 });
    }

    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to update user",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/users/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

    const deleted = await deleteUser(userId);

    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        error: "User not found or cannot be deleted (system user)",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<null> = {
      success: true,
      message: "User deleted successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error deleting user:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to delete user",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
