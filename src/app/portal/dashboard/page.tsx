"use client";

/**
 * Customer Portal Dashboard
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CustomerData {
  id: number;
  code: string;
  full_name: string;
  mobile: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  preferred_language: "en" | "ar";
  credit_limit: number;
  last_login_at: string | null;
}

export default function PortalDashboardPage() {
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

  const handleLogout = async () => {
    await fetch("/api/portal/auth/logout", { method: "POST" });
    router.push("/portal/login");
  };

  const t = {
    en: {
      title: "Dashboard",
      welcome: "Welcome back",
      customerCode: "Customer Code",
      contactInfo: "Contact Information",
      mobile: "Mobile",
      email: "Email",
      phone: "Phone",
      address: "Address",
      creditLimit: "Credit Limit",
      lastLogin: "Last Login",
      quickActions: "Quick Actions",
      viewOrders: "View Orders",
      viewPolicies: "View Policies",
      getQuote: "Get Insurance Quote",
      contactSupport: "Contact Support",
      logout: "Logout",
      noData: "Not provided",
    },
    ar: {
      title: "لوحة التحكم",
      welcome: "مرحباً بعودتك",
      customerCode: "رمز العميل",
      contactInfo: "معلومات الاتصال",
      mobile: "الجوال",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      address: "العنوان",
      creditLimit: "حد الائتمان",
      lastLogin: "آخر دخول",
      quickActions: "إجراءات سريعة",
      viewOrders: "عرض الطلبات",
      viewPolicies: "عرض الوثائق",
      getQuote: "احصل على عرض سعر",
      contactSupport: "تواصل مع الدعم",
      logout: "تسجيل الخروج",
      noData: "غير متوفر",
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
      <header className="bg-[var(--card-bg)] border-b border-[var(--card-border)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-semibold text-lg text-[var(--foreground)]">
                {language === "ar" ? "بوابة العملاء" : "Customer Portal"}
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                className="px-3 py-1 text-sm rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--card-hover)]"
              >
                {language === "en" ? "العربية" : "English"}
              </button>

              {/* Profile */}
              <div className="flex items-center gap-2">
                {customer.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={customer.avatar_url}
                    alt={customer.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {customer.full_name[0]}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-[var(--foreground)] hidden sm:block">
                  {customer.full_name}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-[var(--foreground-muted)] hover:text-[var(--error)] rounded-lg hover:bg-[var(--card-hover)]"
                title={text.logout}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {text.welcome}, {customer.full_name}!
          </h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            {text.customerCode}: <span className="font-mono font-medium text-[var(--primary)]">{customer.code}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="theme-card p-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                {text.contactInfo}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--foreground-muted)]">{text.mobile}</p>
                    <p className="text-[var(--foreground)] font-medium" dir="ltr">{customer.mobile}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--foreground-muted)]">{text.email}</p>
                    <p className="text-[var(--foreground)] font-medium">{customer.email || text.noData}</p>
                  </div>
                </div>

                {customer.address && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--foreground-muted)]">{text.address}</p>
                      <p className="text-[var(--foreground)] font-medium">{customer.address}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--foreground-muted)]">{text.creditLimit}</p>
                    <p className="text-[var(--foreground)] font-medium">{customer.credit_limit.toLocaleString()} OMR</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="theme-card p-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                {text.quickActions}
              </h2>
              <div className="space-y-3">
                <Link
                  href="/portal/orders"
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--card-border)] hover:bg-[var(--card-hover)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-[var(--foreground)]">{text.viewOrders}</span>
                </Link>

                <Link
                  href="/portal/policies"
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--card-border)] hover:bg-[var(--card-hover)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-[var(--foreground)]">{text.viewPolicies}</span>
                </Link>

                <Link
                  href="/"
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--card-border)] hover:bg-[var(--card-hover)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-[var(--foreground)]">{text.getQuote}</span>
                </Link>

                <Link
                  href="/portal/support"
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--card-border)] hover:bg-[var(--card-hover)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-[var(--foreground)]">{text.contactSupport}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
