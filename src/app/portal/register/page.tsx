"use client";

/**
 * Customer Portal Registration Page
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CustomerType = "person" | "company";

interface Company {
  id: number;
  code: string;
  full_name: string;
}

export default function PortalRegisterPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [formData, setFormData] = useState({
    full_name: "",
    customer_type: "person" as CustomerType,
    company_name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Company dropdown state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  // Load companies on mount
  useEffect(() => {
    fetch("/api/customers/companies")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCompanies(data.data);
        }
      })
      .catch(console.error);
  }, []);

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

  // Filter companies based on search
  const filteredCompanies = companies.filter((company) =>
    company.full_name.toLowerCase().includes(companySearch.toLowerCase()) ||
    company.code.toLowerCase().includes(companySearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(language === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError(language === "ar" ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/portal/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name,
          customer_type: formData.customer_type,
          company_name: formData.customer_type === "person" ? formData.company_name || undefined : undefined,
          mobile: formData.mobile,
          email: formData.email || undefined,
          password: formData.password,
          preferred_language: language,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/portal/dashboard");
      } else {
        setError(data.error || (language === "ar" ? "فشل التسجيل" : "Registration failed"));
      }
    } catch {
      setError(language === "ar" ? "حدث خطأ. حاول مرة أخرى." : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const t = {
    en: {
      title: "Create Account",
      subtitle: "Join our customer portal",
      customerType: "Account Type",
      person: "Person",
      company: "Company",
      fullName: "Full Name",
      personName: "Full Name",
      companyName: "Company Name",
      belongsToCompany: "Company (if applicable)",
      searchCompany: "Search for a company...",
      noCompanies: "No companies found",
      mobile: "Mobile Number",
      email: "Email (Optional)",
      password: "Password",
      confirmPassword: "Confirm Password",
      register: "Create Account",
      hasAccount: "Already have an account?",
      login: "Sign in",
      terms: "By creating an account, you agree to our Terms of Service and Privacy Policy.",
    },
    ar: {
      title: "إنشاء حساب",
      subtitle: "انضم إلى بوابة العملاء",
      customerType: "نوع الحساب",
      person: "شخص",
      company: "شركة",
      fullName: "الاسم الكامل",
      personName: "الاسم الكامل",
      companyName: "اسم الشركة",
      belongsToCompany: "الشركة (إن وجدت)",
      searchCompany: "ابحث عن شركة...",
      noCompanies: "لا توجد شركات",
      mobile: "رقم الجوال",
      email: "البريد الإلكتروني (اختياري)",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      register: "إنشاء حساب",
      hasAccount: "لديك حساب بالفعل؟",
      login: "تسجيل الدخول",
      terms: "بإنشاء حساب، فإنك توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا.",
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

        {/* Register Card */}
        <div className="theme-card p-8">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
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

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Type */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                {text.customerType} *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="customer_type"
                    value="person"
                    checked={formData.customer_type === "person"}
                    onChange={(e) => setFormData({ ...formData, customer_type: e.target.value as CustomerType })}
                    className="w-4 h-4 text-[var(--primary)]"
                  />
                  <span className="text-[var(--foreground)]">{text.person}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="customer_type"
                    value="company"
                    checked={formData.customer_type === "company"}
                    onChange={(e) => setFormData({ ...formData, customer_type: e.target.value as CustomerType })}
                    className="w-4 h-4 text-[var(--primary)]"
                  />
                  <span className="text-[var(--foreground)]">{text.company}</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {formData.customer_type === "company" ? text.companyName : text.personName} *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="theme-input w-full"
              />
            </div>

            {/* Company name for persons - Searchable Dropdown */}
            {formData.customer_type === "person" && (
              <div className="relative">
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  {text.belongsToCompany}
                </label>
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => {
                    setCompanySearch(e.target.value);
                    setShowCompanyDropdown(true);
                    if (!e.target.value) {
                      setFormData({ ...formData, company_name: "" });
                    }
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  className="theme-input w-full"
                  placeholder={text.searchCompany}
                  autoComplete="off"
                />
                
                {/* Clear button */}
                {companySearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setCompanySearch("");
                      setFormData({ ...formData, company_name: "" });
                    }}
                    className="absolute right-2 top-8 p-1 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Dropdown */}
                {showCompanyDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowCompanyDropdown(false)}
                    />
                    <div className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-lg">
                      {filteredCompanies.length === 0 ? (
                        <div className="p-3 text-sm text-[var(--foreground-muted)] text-center">
                          {text.noCompanies}
                        </div>
                      ) : (
                        filteredCompanies.map((company) => (
                          <button
                            key={company.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, company_name: company.full_name });
                              setCompanySearch(company.full_name);
                              setShowCompanyDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-[var(--card-hover)] transition-colors flex items-center justify-between"
                          >
                            <span className="text-[var(--foreground)]">{company.full_name}</span>
                            <span className="text-xs text-[var(--foreground-muted)] font-mono">{company.code}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {text.mobile} *
              </label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="theme-input w-full"
                placeholder="+968 9999 9999"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {text.email}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="theme-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {text.password} *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="theme-input w-full"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {text.confirmPassword} *
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="theme-input w-full"
                minLength={6}
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
                text.register
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-4 text-xs text-center text-[var(--foreground-muted)]">
            {text.terms}
          </p>

          {/* Links */}
          <div className="mt-6 text-center text-sm">
            <p className="text-[var(--foreground-muted)]">
              {text.hasAccount}{" "}
              <Link href="/portal/login" className="text-[var(--primary)] hover:underline">
                {text.login}
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
