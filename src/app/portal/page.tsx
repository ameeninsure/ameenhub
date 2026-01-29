"use client";

/**
 * Customer Portal Index - Redirects to login or dashboard
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortalIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if logged in
    fetch("/api/portal/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          router.push("/portal/dashboard");
        } else {
          router.push("/portal/login");
        }
      })
      .catch(() => {
        router.push("/portal/login");
      });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
    </div>
  );
}
