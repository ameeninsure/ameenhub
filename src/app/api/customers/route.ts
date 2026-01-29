import { NextResponse } from "next/server";
import {
  getCustomers,
  createCustomer,
  getCustomerCount,
  getCustomersByCreators,
  getCustomerCountByCreators,
} from "@/db/queries/customers";
import { getUserWithPermissions, getAllSubordinates } from "@/lib/permissions/queries";
import { getCurrentUser as getAuthUser } from "@/lib/auth";

// Helper to get current user with permissions
async function getCurrentUser() {
  const tokenPayload = await getAuthUser();
  if (!tokenPayload) return null;
  
  try {
    const user = await getUserWithPermissions(tokenPayload.userId);
    return user;
  } catch (error) {
    console.error("Failed to get user permissions:", error);
    return null;
  }
}

// Check if user can view all customers (super_admin, admin, or has customers.view_all permission)
function canViewAllCustomers(roles: { code: string }[], permissions: string[]): boolean {
  // Super admin and admin can see all customers
  const hasAdminRole = roles.some(r => r.code === "super_admin" || r.code === "admin");
  if (hasAdminRole) return true;
  
  // Or has specific permission
  return permissions.includes("customers.view_all") || permissions.includes("*");
}

// GET /api/customers
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    // Check if user can see all customers (super_admin, admin, or has permission)
    const userCanViewAll = canViewAllCustomers(user.roles, user.permissions);

    let customers;
    let total;

    if (userCanViewAll) {
      // Admin can see all
      [customers, total] = await Promise.all([
        getCustomers(limit, offset, user.id, true),
        getCustomerCount(user.id, true),
      ]);
    } else {
      // Get subordinates and include their data
      const subordinates = await getAllSubordinates(user.id);
      const allowedCreators = [user.id, ...subordinates];
      
      [customers, total] = await Promise.all([
        getCustomersByCreators(limit, offset, allowedCreators),
        getCustomerCountByCreators(allowedCreators),
      ]);
    }

    return NextResponse.json({
      success: true,
      data: customers,
      isAdmin: userCanViewAll,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + customers.length < total,
      },
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST /api/customers
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Basic validation - full_name and mobile are required
    if (!body.full_name || !body.mobile) {
      return NextResponse.json(
        { success: false, error: "full_name and mobile are required" },
        { status: 400 }
      );
    }

    const customer = await createCustomer({
      full_name: body.full_name,
      customer_type: body.customer_type || "person",
      company_name: body.company_name,
      name: body.name || body.full_name,
      email: body.email,
      phone: body.phone,
      mobile: body.mobile,
      address: body.address,
      credit_limit: body.credit_limit,
      avatar_url: body.avatar_url,
      preferred_language: body.preferred_language,
      created_by: user.id, // Set the creator
    });

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error) {
    console.error("Failed to create customer:", error);

    // Handle unique constraint violation
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json(
        { success: false, error: "Customer with this mobile already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
