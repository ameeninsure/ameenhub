"use client";

/**
 * Customer Portal - Policies Page
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CustomerData {
  id: number;
  code: string;
  full_name: string;
  preferred_language: "en" | "ar";
}

export default function PortalPoliciesPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "ar">("en");

  useEffect(() => {
    fetch("/api/portal/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCustomer(data.data);
          setLanguage(data.data.preferred_language || "en");
        } else {
          router.push("/portal/login");
        }
      })
      .catch(() => {
        router.push("/portal/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const t = {
    en: {
      title: "My Policies",
      backToDashboard: "Back to Dashboard",
      noPolicies: "You don't have any insurance policies yet.",
      getQuote: "Get Insurance Quote",
    },
    ar: {
      title: "وثائقي",
      backToDashboard: "العودة للوحة التحكم",
      noPolicies: "لا توجد لديك وثائق تأمين بعد.",
      getQuote: "احصل على عرض سعر",
    },
  };

  const text = t[language];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="bg-[var(--card-bg)] border-b border-[var(--card-border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/portal/dashboard"
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-[var(--foreground)]">{text.title}</h1>
            </div>
            <div className="text-sm text-[var(--foreground-muted)]">
              {customer.full_name}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="theme-card p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-[var(--foreground-muted)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-[var(--foreground-muted)] mb-6">{text.noPolicies}</p>
          <button className="theme-button-primary">
            {text.getQuote}
          </button>
        </div>
      </main>
    </div>
  );
}
