"use client";

/**
 * Login Page
 * User authentication for the admin panel
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

export default function LoginPage() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/panel");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        router.push("/panel");
      } else {
        setError(result.error || (language === "ar" ? "اسم المستخدم أو كلمة المرور غير صحيحة" : "Invalid username or password"));
      }
    } catch {
      setError(language === "ar" ? "حدث خطأ أثناء تسجيل الدخول" : "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--background)] to-[var(--background-secondary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--background)] to-[var(--background-secondary)] p-4" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          className="flex items-center gap-2 px-3 py-2 bg-[var(--card)] rounded-lg shadow-[var(--shadow)] text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--card-hover)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span>{language === "en" ? "العربية" : "English"}</span>
        </button>
      </div>

      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-[var(--card)] rounded-lg shadow-[var(--shadow)] text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--card-hover)] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>{language === "ar" ? "الرئيسية" : "Home"}</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            AmeenHub
          </h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            {language === "ar" ? "تسجيل الدخول إلى لوحة التحكم" : "Sign in to admin panel"}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-[var(--card)] rounded-2xl shadow-[var(--shadow-xl)] border border-[var(--card-border)] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="theme-alert theme-alert-error">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                {t.users.username}
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="theme-input w-full px-4 py-3"
                placeholder={language === "ar" ? "أدخل اسم المستخدم" : "Enter your username"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                {t.users.password}
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="theme-input w-full px-4 py-3"
                placeholder={language === "ar" ? "أدخل كلمة المرور" : "Enter your password"}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                  className="w-4 h-4 text-[var(--primary)] border-[var(--input-border)] rounded focus:ring-[var(--primary)]"
                />
                <span className="text-sm text-[var(--foreground-muted)]">
                  {language === "ar" ? "تذكرني" : "Remember me"}
                </span>
              </label>
              <a href="#" className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)]">
                {language === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-medium rounded-lg hover:opacity-90 focus:ring-4 focus:ring-[var(--primary-light)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{language === "ar" ? "جاري تسجيل الدخول..." : "Signing in..."}</span>
                </span>
              ) : (
                <span>{language === "ar" ? "تسجيل الدخول" : "Sign In"}</span>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--card-border)]">
            <p className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">
              {language === "ar" ? "بيانات تجريبية:" : "Demo Credentials:"}
            </p>
            <div className="text-sm text-[var(--foreground-muted)] space-y-1">
              <p><span className="font-medium">{language === "ar" ? "المستخدم:" : "Username:"}</span> admin</p>
              <p><span className="font-medium">{language === "ar" ? "كلمة المرور:" : "Password:"}</span> admin123</p>
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-[var(--foreground-muted)] mt-6">
            {language === "ar" ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
            <Link href="/register" className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium">
              {language === "ar" ? "سجل الآن" : "Sign Up"}
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[var(--foreground-muted)] mt-6">
          © 2024 AmeenHub. {language === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved."}
        </p>
      </div>
    </div>
  );
}
