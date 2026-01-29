"use client";

import { LanguageProvider } from "@/lib/i18n";
import { PermissionProvider } from "@/lib/permissions/client";
import { PanelSidebar } from "@/components/panel/Sidebar";
import { PanelHeader } from "@/components/panel/Header";
import { useEffect, useState } from "react";
import { useAppearance } from "@/lib/settings";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { appearance } = useAppearance();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(!appearance.compactSidebar);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    setSidebarOpen(!appearance.compactSidebar);
  }, [appearance.compactSidebar]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
          <p className="text-[var(--foreground-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect is happening
  if (!isAuthenticated) {
    return null;
  }

  return (
    <LanguageProvider>
      <PermissionProvider userId={user?.id || 1}>
        <div className="min-h-screen bg-[var(--background)] transition-colors duration-200">
          {/* Mobile sidebar overlay */}
          {mobileSidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-[var(--overlay)] backdrop-blur-sm lg:hidden transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <PanelSidebar
            isOpen={sidebarOpen}
            isMobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />

          {/* Main content */}
          <div
            className={`transition-all duration-300 ${
              sidebarOpen ? "lg:ml-64" : "lg:ml-20"
            }`}
          >
            {/* Header */}
            <PanelHeader
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              onMobileMenuClick={() => setMobileSidebarOpen(true)}
            />

            {/* Page content */}
            <main className="p-4 md:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </PermissionProvider>
    </LanguageProvider>
  );
}
