"use client";

/**
 * Dashboard Page
 * Main dashboard for the admin panel
 */

import React from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { PermissionGate } from "@/lib/permissions/client";

// Stat Card Component
interface StatCardProps {
  title: string;
  titleAr: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  color: "blue" | "green" | "yellow" | "purple" | "red";
}

function StatCard({ title, titleAr, value, icon, change, changeType = "neutral", color }: StatCardProps) {
  const { language } = useLanguage();

  const colorClasses = {
    blue: "bg-[var(--primary)]",
    green: "bg-[var(--success)]",
    yellow: "bg-[var(--warning)]",
    purple: "bg-[var(--accent)]",
    red: "bg-[var(--error)]",
  };

  return (
    <div className="bg-[var(--card)] rounded-xl p-6 shadow-[var(--shadow)] border border-[var(--card-border)] transition-all hover:shadow-[var(--shadow-md)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--foreground-muted)]">
            {language === "ar" ? titleAr : title}
          </p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-2 ${
              changeType === "increase" ? "text-[var(--success)]" :
              changeType === "decrease" ? "text-[var(--error)]" : "text-[var(--foreground-muted)]"
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <span className="text-white">{icon}</span>
        </div>
      </div>
    </div>
  );
}

// Icons
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const OrdersIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const RevenueIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CustomersIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export default function DashboardPage() {
  const { language } = useLanguage();

  return (
    <div className="space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          {language === "ar" ? "لوحة التحكم" : "Dashboard"}
        </h1>
        <p className="text-[var(--foreground-muted)] mt-1">
          {language === "ar" 
            ? "مرحباً بك في لوحة تحكم أمين هب" 
            : "Welcome to Ameen Hub Dashboard"
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PermissionGate permission="dashboard.widgets.customers">
          <StatCard
            title="Total Users"
            titleAr="إجمالي المستخدمين"
            value="1,234"
            icon={<UsersIcon />}
            change="+12% from last month"
            changeType="increase"
            color="blue"
          />
        </PermissionGate>

        <PermissionGate permission="dashboard.widgets.orders">
          <StatCard
            title="Total Orders"
            titleAr="إجمالي الطلبات"
            value="5,678"
            icon={<OrdersIcon />}
            change="+8% from last month"
            changeType="increase"
            color="green"
          />
        </PermissionGate>

        <PermissionGate permission="dashboard.widgets.sales">
          <StatCard
            title="Revenue"
            titleAr="الإيرادات"
            value="$45,678"
            icon={<RevenueIcon />}
            change="+23% from last month"
            changeType="increase"
            color="purple"
          />
        </PermissionGate>

        <PermissionGate permission="dashboard.widgets.customers">
          <StatCard
            title="Customers"
            titleAr="العملاء"
            value="892"
            icon={<CustomersIcon />}
            change="+5% from last month"
            changeType="increase"
            color="yellow"
          />
        </PermissionGate>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-[var(--card)] rounded-xl p-6 shadow-[var(--shadow)] border border-[var(--card-border)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            {language === "ar" ? "النشاط الأخير" : "Recent Activity"}
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 pb-4 border-b border-[var(--card-border)] last:border-0 last:pb-0">
                <div className="w-10 h-10 bg-[var(--primary-light)] rounded-full flex items-center justify-center">
                  <span className="text-[var(--primary)] text-sm font-medium">
                    {i}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--foreground)]">
                    {language === "ar" 
                      ? `نشاط المستخدم رقم ${i}` 
                      : `User activity ${i}`
                    }
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {language === "ar" ? "منذ 5 دقائق" : "5 minutes ago"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-[var(--card)] rounded-xl p-6 shadow-[var(--shadow)] border border-[var(--card-border)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            {language === "ar" ? "إحصائيات سريعة" : "Quick Stats"}
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[var(--foreground-secondary)]">
                {language === "ar" ? "المستخدمون النشطون" : "Active Users"}
              </span>
              <span className="font-semibold text-[var(--foreground)]">1,024</span>
            </div>
            <div className="theme-progress">
              <div className="theme-progress-bar theme-progress-bar-primary" style={{ width: "75%" }}></div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <span className="text-[var(--foreground-secondary)]">
                {language === "ar" ? "الطلبات المعلقة" : "Pending Orders"}
              </span>
              <span className="font-semibold text-[var(--foreground)]">234</span>
            </div>
            <div className="theme-progress">
              <div className="theme-progress-bar theme-progress-bar-warning" style={{ width: "45%" }}></div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <span className="text-[var(--foreground-secondary)]">
                {language === "ar" ? "الطلبات المكتملة" : "Completed Orders"}
              </span>
              <span className="font-semibold text-[var(--foreground)]">4,567</span>
            </div>
            <div className="theme-progress">
              <div className="theme-progress-bar theme-progress-bar-success" style={{ width: "90%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
