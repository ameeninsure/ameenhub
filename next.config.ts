import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { join } from "path";

// Read package.json
const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf-8")
);

// Get current date for build date
const buildDate = new Date().toISOString().split('T')[0];

// Determine environment
const environment = process.env.NODE_ENV === "production" ? "Production" : "Development";

// Build number from environment or default
const buildNumber = process.env.BUILD_NUMBER || (process.env.NODE_ENV === "production" ? "1" : "dev");

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: "standalone",
  
  // Auto-inject environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Ameen Hub",
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
    NEXT_PUBLIC_BUILD_NUMBER: buildNumber,
    NEXT_PUBLIC_BUILD_DATE: buildDate,
    NEXT_PUBLIC_ENVIRONMENT: environment,
    NEXT_PUBLIC_NEXT_VERSION: packageJson.dependencies.next?.replace(/^[^\d]*/, "") || "unknown",
    NEXT_PUBLIC_NODE_VERSION: process.version.replace(/^v/, ""),
    NEXT_PUBLIC_DB_ENGINE: process.env.NEXT_PUBLIC_DB_ENGINE || "PostgreSQL",
    NEXT_PUBLIC_STORAGE: process.env.NEXT_PUBLIC_STORAGE || "Local Filesystem",
  },
};

export default nextConfig;
