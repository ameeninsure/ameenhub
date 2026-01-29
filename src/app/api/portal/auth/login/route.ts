/**
 * Customer Portal Authentication API - Login
 * Handles customer login with mobile and password
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { verifyCustomerPassword } from "@/db/queries/customers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export async function POST(request: Request) {
  try {
    const { mobile, password } = await request.json();

    // Validate input
    if (!mobile || !password) {
      return NextResponse.json(
        { success: false, error: "Mobile and password are required" },
        { status: 400 }
      );
    }

    // Verify credentials
    const customer = await verifyCustomerPassword(mobile, password);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Invalid mobile or password" },
        { status: 401 }
      );
    }

    // Create JWT token for customer
    const token = await new SignJWT({
      customerId: customer.id,
      code: customer.code,
      mobile: customer.mobile,
      type: "customer", // Distinguish from user tokens
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
    console.error("Customer login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
