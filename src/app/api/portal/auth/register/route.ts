/**
 * Customer Portal Authentication API - Register
 * Handles customer self-registration
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { createCustomer, getCustomerByMobile } from "@/db/queries/customers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.full_name || !body.mobile || !body.password) {
      return NextResponse.json(
        { success: false, error: "Full name, mobile, and password are required" },
        { status: 400 }
      );
    }

    // Check if mobile already exists
    const existingCustomer = await getCustomerByMobile(body.mobile);
    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: "Mobile number already registered" },
        { status: 409 }
      );
    }

    // Password validation
    if (body.password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Create customer (created_by is null for self-registration)
    const customer = await createCustomer({
      full_name: body.full_name,
      customer_type: body.customer_type || "person",
      company_name: body.company_name,
      mobile: body.mobile,
      email: body.email,
      password: body.password,
      preferred_language: body.preferred_language || "en",
      // created_by is null for self-registration
    });

    // Create JWT token
    const token = await new SignJWT({
      customerId: customer.id,
      code: customer.code,
      mobile: customer.mobile,
      type: "customer",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("customer-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      data: {
        id: customer.id,
        code: customer.code,
        full_name: customer.full_name,
        mobile: customer.mobile,
        email: customer.email,
        avatar_url: customer.avatar_url,
        preferred_language: customer.preferred_language,
      },
    });
  } catch (error) {
    console.error("Customer registration error:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    );
  }
}
