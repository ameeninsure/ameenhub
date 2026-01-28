"use client";

import { LanguageProvider } from "@/lib/i18n";
import { PermissionProvider } from "@/lib/permissions/client";
import { PanelSidebar } from "@/components/panel/Sidebar";
import { PanelHeader } from "@/components/panel/Header";
import { useState } from "react";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // TODO: Get actual user ID from authentication
  const userId = 1; // Default admin user

  return (
    <LanguageProvider>
      <PermissionProvider userId={userId}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Mobile sidebar overlay */}
          {mobileSidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
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
