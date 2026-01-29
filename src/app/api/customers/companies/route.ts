/**
 * API to get all companies for dropdown selection
 * Used when adding a person customer that belongs to a company
 */

import { NextResponse } from "next/server";
import { getCompanies } from "@/db/queries/customers";

// GET /api/customers/companies
export async function GET() {
  try {
    const companies = await getCompanies();
    return NextResponse.json({ success: true, data: companies });
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
