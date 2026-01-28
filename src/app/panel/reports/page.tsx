"use client";

/**
 * Reports Page
 * Analytics and Reports - Coming Soon
 */

import React from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ReportsIcon = () => (
  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ChartBarIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PieChartIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const DocumentReportIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default function ReportsPage() {
  const { language } = useLanguage();

  const reportTypes = [
    {
      icon: <ChartBarIcon />,
      titleEn: "Sales Reports",
      titleAr: "تقارير المبيعات",
      descEn: "Track sales performance and trends",
      descAr: "تتبع أداء المبيعات والاتجاهات",
    },
    {
      icon: <PieChartIcon />,
      titleEn: "Customer Analytics",
      titleAr: "تحليلات العملاء",
      descEn: "Understand customer behavior",
      descAr: "فهم سلوك العملاء",
    },
    {
      icon: <TrendingUpIcon />,
      titleEn: "Growth Metrics",
      titleAr: "مقاييس النمو",
      descEn: "Monitor business growth",
      descAr: "مراقبة نمو الأعمال",
    },
    {
      icon: <DocumentReportIcon />,
      titleEn: "Custom Reports",
      titleAr: "تقارير مخصصة",
      descEn: "Create custom report templates",
      descAr: "إنشاء قوالب تقارير مخصصة",
    },
  ];

  return (
    <div className="space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          {language === "ar" ? "التقارير" : "Reports"}
        </h1>
        <p className="text-[var(--foreground-muted)] mt-1">
          {language === "ar" ? "التحليلات والتقارير المتقدمة" : "Advanced analytics and reports"}
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="theme-card p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)] mb-6">
            <ReportsIcon />
          </div>
          
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            {language === "ar" ? "قريباً" : "Coming Soon"}
          </h2>
          
          <p className="text-[var(--foreground-muted)] max-w-md">
            {language === "ar" 
              ? "نعمل على تطوير نظام التقارير المتقدم. ستتمكن قريباً من الوصول إلى تحليلات شاملة."
              : "We're working on the advanced reporting system. Soon you'll have access to comprehensive analytics."}
          </p>
        </div>
      </div>

      {/* Report Types Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((report, index) => (
          <div 
            key={index}
            className="theme-card p-6 opacity-60 cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-[var(--background-secondary)] text-[var(--foreground-muted)]">
                {report.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--foreground)]">
                  {language === "ar" ? report.titleAr : report.titleEn}
                </h3>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">
                  {language === "ar" ? report.descAr : report.descEn}
                </p>
                <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-[var(--background-secondary)] text-[var(--foreground-muted)]">
                  {language === "ar" ? "قريباً" : "Coming Soon"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
