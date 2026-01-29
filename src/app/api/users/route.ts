/**
 * Users API Routes
 * GET /api/users - List all users
 * POST /api/users - Create a new user
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, getUserCount, createUser } from "@/lib/permissions";
import type { CreateUserInput, ApiResponse, PaginatedResponse, SafeUser } from "@/lib/permissions";
import bcrypt from "bcryptjs";

// GET /api/users
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const activeOnly = searchParams.get("activeOnly") !== "false";
    const offset = (page - 1) * limit;

    const [users, total] = await Promise.all([
      getAllUsers(activeOnly, limit, offset),
      getUserCount(activeOnly),
    ]);

    const response: PaginatedResponse<SafeUser> = {
      success: true,
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching users:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to fetch users",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["username", "email", "password", "full_name"];
    for (const field of requiredFields) {
      if (!body[field]) {
        const response: ApiResponse<null> = {
          success: false,
          error: `Missing required field: ${field}`,
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Invalid email format",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate password length
    if (body.password.length < 8) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Password must be at least 8 characters long",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(body.password, 10);

    const input: CreateUserInput = {
      username: body.username,
      email: body.email,
      password: body.password,
      full_name: body.full_name,
      full_name_ar: body.full_name_ar,
      position: body.position,
      phone: body.phone,
      avatar_url: body.avatar_url,
      preferred_language: body.preferred_language,
      manager_id: body.manager_id || null,
    };

    const user = await createUser(input, passwordHash);

    const response: ApiResponse<SafeUser> = {
      success: true,
      data: user,
      message: "User created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    
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
      error: "Failed to create user",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
