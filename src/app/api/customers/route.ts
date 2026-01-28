import { NextResponse } from "next/server";
import {
  getCustomers,
  createCustomer,
  getCustomerCount,
} from "@/db/queries/customers";

// GET /api/customers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const [customers, total] = await Promise.all([
      getCustomers(limit, offset),
      getCustomerCount(),
    ]);

    return NextResponse.json({
      data: customers,
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
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST /api/customers
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.code || !body.name) {
      return NextResponse.json(
        { error: "code and name are required" },
        { status: 400 }
      );
    }

    const customer = await createCustomer({
      code: body.code,
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      credit_limit: body.credit_limit,
    });

    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (error) {
    console.error("Failed to create customer:", error);

    // Handle unique constraint violation
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json(
        { error: "Customer code already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
