"use client";

/**
 * Registration Page
 * User signup for the platform
 */

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirm_password: "",
    preferred_language: language,
    agree_terms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError(language === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }

    if (!formData.agree_terms) {
      setError(language === "ar" ? "يجب الموافقة على الشروط والأحكام" : "You must agree to the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone,
          preferred_language: formData.preferred_language,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Auto login after registration
        localStorage.setItem("auth_token", "demo_token");
        localStorage.setItem("user", JSON.stringify(data.data));
        router.push("/panel");
      } else {
        setError(data.error || (language === "ar" ? "حدث خطأ أثناء التسجيل" : "Registration failed"));
      }
    } catch {
      setError(language === "ar" ? "حدث خطأ أثناء التسجيل" : "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.full_name || !formData.email) {
        setError(language === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all required fields");
        return;
      }
    }
    setError("");
    setStep(step + 1);
  };

  const prevStep = () => {
    setError("");
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          className="flex items-center gap-2 px-3 py-2 bg-[var(--card)] rounded-lg shadow-[var(--shadow-sm)] text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--card-hover)] transition-colors"
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
        className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-[var(--card)] rounded-lg shadow-[var(--shadow-sm)] text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--card-hover)] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>{language === "ar" ? "الرئيسية" : "Home"}</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--success)] to-emerald-600 shadow-lg shadow-emerald-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {language === "ar" ? "إنشاء حساب جديد" : "Create Account"}
          </h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            {language === "ar" ? "انضم إلينا اليوم" : "Join us today"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center ${s < 3 ? "flex-1" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s <= step
                    ? "bg-[var(--success)] text-white"
                    : "bg-[var(--background-secondary)] text-[var(--foreground-muted)]"
                }`}
              >
                {s < step ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-colors ${
                    s < step ? "bg-[var(--success)]" : "bg-[var(--background-secondary)]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Registration Form */}
        <div className="bg-[var(--card)] rounded-2xl shadow-[var(--shadow-xl)] border border-[var(--card-border)] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="theme-alert theme-alert-error">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <>
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  {language === "ar" ? "المعلومات الشخصية" : "Personal Information"}
                </h2>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                    {t.users.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="theme-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                    {t.users.email} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="theme-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                    {t.users.phone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="theme-input w-full"
                  />
                </div>
              </>
            )}

            {/* Step 2: Account Info */}
            {step === 2 && (
              <>
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  {language === "ar" ? "معلومات الحساب" : "Account Information"}
                </h2>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                    {t.users.username} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="theme-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                    {t.users.password} *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="theme-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                    {t.users.confirmPassword} *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    className="theme-input w-full"
                  />
                </div>
              </>
            )}

            {/* Step 3: Preferences & Confirm */}
            {step === 3 && (
              <>
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  {language === "ar" ? "التفضيلات والتأكيد" : "Preferences & Confirmation"}
                </h2>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                    {t.users.preferredLanguage}
                  </label>
                  <select
                    value={formData.preferred_language}
                    onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value as "en" | "ar" })}
                    className="theme-input w-full"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-lg bg-[var(--background-secondary)] space-y-2">
                  <h3 className="text-sm font-medium text-[var(--foreground-secondary)]">
                    {language === "ar" ? "ملخص التسجيل" : "Registration Summary"}
                  </h3>
                  <div className="text-sm text-[var(--foreground-muted)] space-y-1">
                    <p><span className="font-medium">{language === "ar" ? "الاسم:" : "Name:"}</span> {formData.full_name}</p>
                    <p><span className="font-medium">{language === "ar" ? "البريد:" : "Email:"}</span> {formData.email}</p>
                    <p><span className="font-medium">{language === "ar" ? "المستخدم:" : "Username:"}</span> {formData.username}</p>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agree_terms}
                    onChange={(e) => setFormData({ ...formData, agree_terms: e.target.checked })}
                    className="mt-1 w-4 h-4 text-[var(--success)] border-[var(--input-border)] rounded focus:ring-[var(--success)]"
                  />
                  <span className="text-sm text-[var(--foreground-muted)]">
                    {language === "ar"
                      ? "أوافق على الشروط والأحكام وسياسة الخصوصية"
                      : "I agree to the Terms and Conditions and Privacy Policy"}
                  </span>
                </label>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="theme-btn-secondary flex-1"
                >
                  {language === "ar" ? "السابق" : "Previous"}
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[var(--success)] to-emerald-600 text-white font-medium rounded-lg hover:opacity-90 transition-all"
                >
                  {language === "ar" ? "التالي" : "Next"}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[var(--success)] to-emerald-600 text-white font-medium rounded-lg hover:opacity-90 focus:ring-4 focus:ring-[var(--success-light)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{language === "ar" ? "جاري التسجيل..." : "Registering..."}</span>
                    </span>
                  ) : (
                    <span>{language === "ar" ? "إنشاء الحساب" : "Create Account"}</span>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-[var(--foreground-muted)] mt-6">
            {language === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
            <Link href="/login" className="text-[var(--success)] hover:opacity-80 font-medium">
              {language === "ar" ? "تسجيل الدخول" : "Login"}
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
