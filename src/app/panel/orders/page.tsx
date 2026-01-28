"use client";

/**
 * Orders Page
 * Order management - Coming Soon
 */

import React from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const OrdersIcon = () => (
  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

export default function OrdersPage() {
  const { language } = useLanguage();

  return (
    <div className="space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          {language === "ar" ? "الطلبات" : "Orders"}
        </h1>
        <p className="text-[var(--foreground-muted)] mt-1">
          {language === "ar" ? "إدارة الطلبات والمبيعات" : "Manage orders and sales"}
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="theme-card p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-6">
            <OrdersIcon />
          </div>
          
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            {language === "ar" ? "قريباً" : "Coming Soon"}
          </h2>
          
          <p className="text-[var(--foreground-muted)] max-w-md">
            {language === "ar" 
              ? "نعمل على تطوير هذه الصفحة. ستتمكن قريباً من إدارة الطلبات وتتبع حالتها."
              : "We're working on this page. Soon you'll be able to manage orders and track their status."}
          </p>

          {/* Feature Preview */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4 w-full max-w-3xl">
            <div className="p-4 rounded-lg bg-[var(--background-secondary)] text-center">
              <div className="text-2xl font-bold text-[var(--primary)]">--</div>
              <div className="text-sm text-[var(--foreground-muted)] mt-1">
                {language === "ar" ? "إجمالي الطلبات" : "Total Orders"}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--background-secondary)] text-center">
              <div className="text-2xl font-bold text-[var(--warning)]">--</div>
              <div className="text-sm text-[var(--foreground-muted)] mt-1">
                {language === "ar" ? "قيد الانتظار" : "Pending"}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--background-secondary)] text-center">
              <div className="text-2xl font-bold text-[var(--info)]">--</div>
              <div className="text-sm text-[var(--foreground-muted)] mt-1">
                {language === "ar" ? "قيد المعالجة" : "Processing"}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--background-secondary)] text-center">
              <div className="text-2xl font-bold text-[var(--success)]">--</div>
              <div className="text-sm text-[var(--foreground-muted)] mt-1">
                {language === "ar" ? "مكتمل" : "Completed"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
