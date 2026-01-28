import { NextResponse } from "next/server";
import { healthCheck, getPoolStats } from "@/db";

// GET /api/health
export async function GET() {
  const dbHealthy = await healthCheck();
  const poolStats = getPoolStats();

  const status = dbHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: dbHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: dbHealthy,
        pool: poolStats,
      },
    },
    { status }
  );
}
