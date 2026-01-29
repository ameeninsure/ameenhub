"use client";

/**
 * Customer Portal Login Page
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PortalLoginPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    fetch("/api/portal/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          router.push("/portal/dashboard");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/portal/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, password }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/portal/dashboard");
      } else {
        setError(data.error || (language === "ar" ? "فشل تسجيل الدخول" : "Login failed"));
      }
    } catch {
      setError(language === "ar" ? "حدث خطأ. حاول مرة أخرى." : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const t = {
    en: {
      title: "Customer Portal",
      subtitle: "Sign in to your account",
      mobile: "Mobile Number",
      password: "Password",
      login: "Sign In",
      noAccount: "Don't have an account?",
      register: "Register here",
      forgotPassword: "Forgot password?",
    },
    ar: {
      title: "بوابة العملاء",
      subtitle: "تسجيل الدخول إلى حسابك",
      mobile: "رقم الجوال",
      password: "كلمة المرور",
      login: "تسجيل الدخول",
      noAccount: "ليس لديك حساب؟",
      register: "سجل هنا",
      forgotPassword: "نسيت كلمة المرور؟",
    },
  };

  const text = t[language];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--primary)]/10 via-[var(--background)] to-[var(--accent)]/10 p-4" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="px-3 py-1 text-sm rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground-muted)] hover:bg-[var(--card-hover)]"
          >
            {language === "en" ? "العربية" : "English"}
          </button>
        </div>

        {/* Login Card */}
        <div className="theme-card p-8">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{text.title}</h1>
            <p className="text-[var(--foreground-muted)] mt-1">{text.subtitle}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/30 text-[var(--error)] text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {text.mobile}
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="theme-input w-full"
                placeholder="+966 5XX XXX XXXX"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {text.password}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="theme-input w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="theme-btn-primary w-full py-3 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                text.login
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center text-sm">
            <p className="text-[var(--foreground-muted)]">
              {text.noAccount}{" "}
              <Link href="/portal/register" className="text-[var(--primary)] hover:underline">
                {text.register}
              </Link>
            </p>
          </div>
        </div>

        {/* Back to main site */}
        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--primary)]">
            {language === "ar" ? "← العودة إلى الموقع الرئيسي" : "← Back to main site"}
          </Link>
        </div>
      </div>
    </div>
  );
}
