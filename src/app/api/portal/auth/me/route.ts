/**
 * Customer Portal Authentication API - Me (Get Current Customer)
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getCustomerById } from "@/db/queries/customers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customer-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Check if it's a customer token
    if (payload.type !== "customer") {
      return NextResponse.json(
        { success: false, error: "Invalid token type" },
        { status: 401 }
      );
    }

    // Get customer data
    const customer = await getCustomerById(payload.customerId as number);
    if (!customer || !customer.is_active) {
      return NextResponse.json(
        { success: false, error: "Customer not found or inactive" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: customer.id,
        code: customer.code,
        full_name: customer.full_name,
        mobile: customer.mobile,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        avatar_url: customer.avatar_url,
        preferred_language: customer.preferred_language,
        credit_limit: customer.credit_limit,
        last_login_at: customer.last_login_at,
      },
    });
  } catch (error) {
    console.error("Get customer error:", error);
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }
}
