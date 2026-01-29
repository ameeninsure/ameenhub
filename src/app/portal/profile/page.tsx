"use client";

/**
 * Customer Portal - Profile Page
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
}

export default function PortalProfilePage() {
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
      title: "My Profile",
      backToDashboard: "Back to Dashboard",
      personalInfo: "Personal Information",
      fullName: "Full Name",
      customerCode: "Customer Code",
      mobile: "Mobile",
      email: "Email",
      phone: "Phone",
      address: "Address",
      creditLimit: "Credit Limit",
      language: "Language",
      editProfile: "Edit Profile",
      noData: "Not provided",
    },
    ar: {
      title: "ملفي الشخصي",
      backToDashboard: "العودة للوحة التحكم",
      personalInfo: "المعلومات الشخصية",
      fullName: "الاسم الكامل",
      customerCode: "رمز العميل",
      mobile: "الجوال",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      address: "العنوان",
      creditLimit: "حد الائتمان",
      language: "اللغة",
      editProfile: "تعديل الملف",
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="theme-card p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--card-border)]">
            {customer.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={customer.avatar_url}
                alt={customer.full_name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {customer.full_name?.[0] || "C"}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">{customer.full_name}</h2>
              <p className="text-sm text-[var(--foreground-muted)] font-mono">{customer.code}</p>
            </div>
          </div>

          {/* Info Grid */}
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">{text.personalInfo}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--foreground-muted)]">{text.mobile}</label>
              <p className="text-[var(--foreground)] font-medium" dir="ltr">{customer.mobile}</p>
            </div>
            <div>
              <label className="block text-sm text-[var(--foreground-muted)]">{text.email}</label>
              <p className="text-[var(--foreground)] font-medium">{customer.email || text.noData}</p>
            </div>
            <div>
              <label className="block text-sm text-[var(--foreground-muted)]">{text.phone}</label>
              <p className="text-[var(--foreground)] font-medium" dir="ltr">{customer.phone || text.noData}</p>
            </div>
            <div>
              <label className="block text-sm text-[var(--foreground-muted)]">{text.creditLimit}</label>
              <p className="text-[var(--foreground)] font-medium">{customer.credit_limit.toLocaleString()} OMR</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-[var(--foreground-muted)]">{text.address}</label>
              <p className="text-[var(--foreground)] font-medium">{customer.address || text.noData}</p>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-6 pt-6 border-t border-[var(--card-border)]">
            <button className="theme-button-primary">
              {text.editProfile}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
