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
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    setSidebarOpen(!appearance.compactSidebar);
  }, [appearance.compactSidebar]);

  useEffect(() => {
    const loadMaintenanceState = () => {
      const storedMode = localStorage.getItem("maintenanceMode");
      const storedMessage = localStorage.getItem("maintenanceMessage");
      setMaintenanceMode(storedMode === "true");
      setMaintenanceMessage(storedMessage || "");
    };

    loadMaintenanceState();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "maintenanceMode" || event.key === "maintenanceMessage") {
        loadMaintenanceState();
      }
    };

    const handleMaintenanceChanged = () => {
      loadMaintenanceState();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("maintenanceChanged", handleMaintenanceChanged as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("maintenanceChanged", handleMaintenanceChanged as EventListener);
    };
  }, []);

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
            } ${maintenanceMode ? "pt-10" : ""}`}
          >
            {maintenanceMode && (
              <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--warning)] text-white px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <span>⚠️</span>
                  <span className="font-semibold">
                    {maintenanceMessage || "System is currently in maintenance mode."}
                  </span>
                </div>
              </div>
            )}
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
