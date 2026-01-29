import { NextResponse } from "next/server";
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "@/db/queries/customers";
import { getUserWithPermissions } from "@/lib/permissions/queries";
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

// Check if user is admin
function isAdmin(permissions: string[]): boolean {
  return permissions.includes("customers.view_all") || permissions.includes("*");
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/customers/[id]
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const customerId = parseInt(id, 10);

    if (isNaN(customerId)) {
      return NextResponse.json({ success: false, error: "Invalid customer ID" }, { status: 400 });
    }

    const customer = await getCustomerById(customerId);

    if (!customer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    // Check if user can access this customer
    const userIsAdmin = isAdmin(user.permissions);
    if (!userIsAdmin && customer.created_by !== user.id) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id]
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const customerId = parseInt(id, 10);

    if (isNaN(customerId)) {
      return NextResponse.json({ success: false, error: "Invalid customer ID" }, { status: 400 });
    }

    // Check if user can edit this customer
    const existingCustomer = await getCustomerById(customerId);
    if (!existingCustomer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    const userIsAdmin = isAdmin(user.permissions);
    if (!userIsAdmin && existingCustomer.created_by !== user.id) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const customer = await updateCustomer(customerId, body);

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("Failed to update customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// PATCH /api/customers/[id] - Same as PUT for compatibility
export async function PATCH(request: Request, { params }: RouteParams) {
  return PUT(request, { params });
}

// DELETE /api/customers/[id]
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const customerId = parseInt(id, 10);

    if (isNaN(customerId)) {
      return NextResponse.json({ success: false, error: "Invalid customer ID" }, { status: 400 });
    }

    // Check if user can delete this customer
    const existingCustomer = await getCustomerById(customerId);
    if (!existingCustomer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    const userIsAdmin = isAdmin(user.permissions);
    if (!userIsAdmin && existingCustomer.created_by !== user.id) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    const deleted = await deleteCustomer(customerId);

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Failed to delete customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
