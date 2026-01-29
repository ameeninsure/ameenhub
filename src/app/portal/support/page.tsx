"use client";

/**
 * Customer Portal - Support Page
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

export default function PortalSupportPage() {
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
      title: "Support",
      backToDashboard: "Back to Dashboard",
      contactUs: "Contact Us",
      phone: "Phone",
      email: "Email",
      whatsapp: "WhatsApp",
      workingHours: "Working Hours",
      workingHoursValue: "Sunday - Thursday, 8:00 AM - 5:00 PM",
      sendMessage: "Send Message",
      subject: "Subject",
      message: "Message",
      submit: "Submit",
    },
    ar: {
      title: "الدعم",
      backToDashboard: "العودة للوحة التحكم",
      contactUs: "تواصل معنا",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      whatsapp: "واتساب",
      workingHours: "ساعات العمل",
      workingHoursValue: "الأحد - الخميس، 8:00 صباحاً - 5:00 مساءً",
      sendMessage: "إرسال رسالة",
      subject: "الموضوع",
      message: "الرسالة",
      submit: "إرسال",
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="theme-card p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">{text.contactUs}</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-[var(--foreground-muted)]">{text.phone}</p>
                  <p className="text-[var(--foreground)] font-medium" dir="ltr">+968 1234 5678</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-[var(--foreground-muted)]">{text.email}</p>
                  <p className="text-[var(--foreground)] font-medium">support@ameeninsure.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-[var(--foreground-muted)]">{text.whatsapp}</p>
                  <p className="text-[var(--foreground)] font-medium" dir="ltr">+968 9876 5432</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-[var(--foreground-muted)]">{text.workingHours}</p>
                  <p className="text-[var(--foreground)] font-medium">{text.workingHoursValue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="theme-card p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">{text.sendMessage}</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  {text.subject}
                </label>
                <input
                  type="text"
                  className="theme-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  {text.message}
                </label>
                <textarea
                  rows={5}
                  className="theme-input w-full resize-none"
                ></textarea>
              </div>
              <button type="submit" className="theme-button-primary w-full">
                {text.submit}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
