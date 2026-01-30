"use client";

/**
 * Panel Sidebar Component
 * Navigation sidebar for the admin panel
 */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import { PermissionGate, usePermissions } from "@/lib/permissions/client";

// Icons as simple SVG components
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const RolesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const PermissionsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const CustomersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const OrdersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const ReportsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const OrgChartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const HierarchyIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
);

const MessageIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const InsuranceIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CompanyIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const ProductIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

interface MenuItem {
  id: string;
  labelEn: string;
  labelAr: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
}

interface MenuGroup {
  id: string;
  labelEn: string;
  labelAr: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    id: "main",
    labelEn: "Main",
    labelAr: "الرئيسية",
    items: [
      {
        id: "dashboard",
        labelEn: "Dashboard",
        labelAr: "لوحة التحكم",
        href: "/panel",
        icon: <DashboardIcon />,
        permission: "menu.dashboard",
      },
    ],
  },
  {
    id: "user-management",
    labelEn: "User Management",
    labelAr: "إدارة المستخدمين",
    items: [
      {
        id: "users",
        labelEn: "Users",
        labelAr: "المستخدمون",
        href: "/panel/users",
        icon: <UsersIcon />,
        permission: "menu.users",
      },
      {
        id: "roles",
        labelEn: "Roles",
        labelAr: "الأدوار",
        href: "/panel/roles",
        icon: <RolesIcon />,
        permission: "menu.roles",
      },
    ],
  },
  {
    id: "business",
    labelEn: "Business",
    labelAr: "الأعمال",
    items: [
      {
        id: "customers",
        labelEn: "Customers",
        labelAr: "العملاء",
        href: "/panel/customers",
        icon: <CustomersIcon />,
        permission: "menu.customers",
      },
      {
        id: "orders",
        labelEn: "Orders",
        labelAr: "الطلبات",
        href: "/panel/orders",
        icon: <OrdersIcon />,
        permission: "menu.orders",
      },
    ],
  },
  {
    id: "insurance",
    labelEn: "Insurance",
    labelAr: "التأمين",
    items: [
      {
        id: "insurance-companies",
        labelEn: "Insurance Companies",
        labelAr: "شركات التأمين",
        href: "/panel/insurance/companies",
        icon: <CompanyIcon />,
        permission: "insurance.companies.view",
      },
      {
        id: "insurance-products",
        labelEn: "Insurance Products",
        labelAr: "منتجات التأمين",
        href: "/panel/insurance/products",
        icon: <ProductIcon />,
        permission: "insurance.products.view",
      },
    ],
  },
  {
    id: "communication",
    labelEn: "Communication",
    labelAr: "التواصل",
    items: [
      {
        id: "messages",
        labelEn: "Messages",
        labelAr: "الرسائل",
        href: "/panel/messages",
        icon: <MessageIcon />,
        permission: "menu.messages",
      },
    ],
  },
  {
    id: "analytics",
    labelEn: "Analytics",
    labelAr: "التحليلات",
    items: [
      {
        id: "reports",
        labelEn: "Reports",
        labelAr: "التقارير",
        href: "/panel/reports",
        icon: <ReportsIcon />,
        permission: "menu.reports",
      },
    ],
  },
  {
    id: "system",
    labelEn: "System",
    labelAr: "النظام",
    items: [
      {
        id: "settings",
        labelEn: "Settings",
        labelAr: "الإعدادات",
        href: "/panel/settings",
        icon: <SettingsIcon />,
        permission: "menu.settings",
      },
    ],
  },
];

interface PanelSidebarProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function PanelSidebar({ isOpen, isMobileOpen, onMobileClose }: PanelSidebarProps) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const { hasPermission } = usePermissions();

  const isActiveRoute = (href: string) => {
    if (href === "/panel") {
      return pathname === "/panel";
    }
    return pathname.startsWith(href);
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = isActiveRoute(item.href);
    const label = language === "ar" ? item.labelAr : item.labelEn;

    const menuItemContent = (
      <Link
        href={item.href}
        onClick={onMobileClose}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
          ${isActive
            ? "bg-[var(--sidebar-item-active-bg)] text-[var(--sidebar-item-active)] shadow-sm"
            : "text-[var(--sidebar-item)] hover:bg-[var(--sidebar-item-hover)] hover:text-[var(--foreground)]"
          }
          ${!isOpen && "lg:justify-center lg:px-2"}
        `}
        title={!isOpen ? label : undefined}
      >
        <span className={`flex-shrink-0 ${isActive ? "text-[var(--sidebar-item-active)]" : "text-[var(--sidebar-item)]"}`}>
          {item.icon}
        </span>
        <span className={`font-medium whitespace-nowrap ${!isOpen && "lg:hidden"}`}>
          {label}
        </span>
      </Link>
    );

    if (item.permission) {
      return (
        <PermissionGate key={item.id} permission={item.permission}>
          {menuItemContent}
        </PermissionGate>
      );
    }

    return <div key={item.id}>{menuItemContent}</div>;
  };

  const renderMenuGroup = (group: MenuGroup, showLabel: boolean = true) => {
    const groupLabel = language === "ar" ? group.labelAr : group.labelEn;
    
    // Check if any item in the group is visible to the user
    const hasVisibleItems = group.items.some(item => {
      if (!item.permission) return true;
      return hasPermission(item.permission);
    });

    // Don't render the group if no items are visible
    if (!hasVisibleItems) {
      return null;
    }

    return (
      <div key={group.id} className="mb-6">
        {showLabel && (
          <div className={`mb-2 ${!isOpen && "lg:hidden"}`}>
            <span className="px-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
              {groupLabel}
            </span>
          </div>
        )}
        <div className="space-y-1">
          {group.items.map(renderMenuItem)}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]
          transition-all duration-300 hidden lg:block
          ${isOpen ? "w-64" : "w-20"}
        `}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-[var(--sidebar-border)] ${isOpen ? "px-6" : "px-4 justify-center"}`}>
          <Link href="/panel" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            {isOpen && (
              <span className="text-xl font-bold text-[var(--foreground)]">
                {language === "ar" ? "أمين هب" : "Ameen Hub"}
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
          {menuGroups.map((group) => renderMenuGroup(group, isOpen))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]
          transform transition-transform duration-300 lg:hidden
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        {/* Logo & Close */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--sidebar-border)]">
          <Link href="/panel" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-[var(--foreground)]">
              {language === "ar" ? "أمين هب" : "Ameen Hub"}
            </span>
          </Link>
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--sidebar-item-hover)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
          {menuGroups.map((group) => renderMenuGroup(group, true))}
        </nav>
      </aside>
    </>
  );
}
