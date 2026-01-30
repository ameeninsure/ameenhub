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
import {
  Home,
  Users,
  Shield,
  Key,
  UsersRound,
  ClipboardList,
  BarChart3,
  Settings,
  Building2,
  Network,
  MessageSquare,
  ShieldCheck,
  Building,
  Package,
} from "lucide-react";

// Icon components with colors
const DashboardIcon = () => <Home className="w-5 h-5" color="#3b82f6" />;
const UsersIcon = () => <Users className="w-5 h-5" color="#8b5cf6" />;
const RolesIcon = () => <Shield className="w-5 h-5" color="#10b981" />;
const PermissionsIcon = () => <Key className="w-5 h-5" color="#f59e0b" />;
const CustomersIcon = () => <UsersRound className="w-5 h-5" color="#06b6d4" />;
const OrdersIcon = () => <ClipboardList className="w-5 h-5" color="#ec4899" />;
const ReportsIcon = () => <BarChart3 className="w-5 h-5" color="#14b8a6" />;
const SettingsIcon = () => <Settings className="w-5 h-5" color="#6366f1" />;
const OrgChartIcon = () => <Building2 className="w-5 h-5" color="#f97316" />;
const HierarchyIcon = () => <Network className="w-5 h-5" color="#a855f7" />;
const MessageIcon = () => <MessageSquare className="w-5 h-5" color="#ef4444" />;
const InsuranceIcon = () => <ShieldCheck className="w-5 h-5" color="#22c55e" />;
const CompanyIcon = () => <Building className="w-5 h-5" color="#0ea5e9" />;
const ProductIcon = () => <Package className="w-5 h-5" color="#84cc16" />;

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
        <span className="flex-shrink-0">
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
