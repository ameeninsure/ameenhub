"use client";

/**
 * Customers Page
 * Customer management - Coming Soon
 */

import React from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const CustomersIcon = () => (
  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export default function CustomersPage() {
  const { language } = useLanguage();

  return (
    <div className="space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          {language === "ar" ? "العملاء" : "Customers"}
        </h1>
        <p className="text-[var(--foreground-muted)] mt-1">
          {language === "ar" ? "إدارة بيانات العملاء" : "Manage customer data"}
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="theme-card p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] mb-6">
            <CustomersIcon />
          </div>
          
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            {language === "ar" ? "قريباً" : "Coming Soon"}
          </h2>
          
          <p className="text-[var(--foreground-muted)] max-w-md">
            {language === "ar" 
              ? "نعمل على تطوير هذه الصفحة. ستتمكن قريباً من إدارة بيانات العملاء بشكل كامل."
              : "We're working on this page. Soon you'll be able to fully manage customer data."}
          </p>

          {/* Feature Preview */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            <div className="p-4 rounded-lg bg-[var(--background-secondary)] text-center">
              <div className="text-2xl font-bold text-[var(--primary)]">--</div>
              <div className="text-sm text-[var(--foreground-muted)] mt-1">
                {language === "ar" ? "إجمالي العملاء" : "Total Customers"}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--background-secondary)] text-center">
              <div className="text-2xl font-bold text-[var(--success)]">--</div>
              <div className="text-sm text-[var(--foreground-muted)] mt-1">
                {language === "ar" ? "عملاء نشطون" : "Active Customers"}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--background-secondary)] text-center">
              <div className="text-2xl font-bold text-[var(--accent)]">--</div>
              <div className="text-sm text-[var(--foreground-muted)] mt-1">
                {language === "ar" ? "عملاء جدد" : "New This Month"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
