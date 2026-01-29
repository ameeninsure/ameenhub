"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { authenticatedFetch, useAuth } from "@/lib/auth/AuthContext";

type CustomerType = "person" | "company";

interface CustomerDetail {
  id: number;
  code: string;
  name: string;
  full_name: string | null;
  full_name_ar: string | null;
  customer_type: CustomerType;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  credit_limit: number;
  is_active: boolean;
  avatar_url: string | null;
  preferred_language: "en" | "ar";
  created_by: number | null;
  creator_name?: string | null;
  creator_name_ar?: string | null;
  creator_avatar_url?: string | null;
  creator_email?: string | null;
  creator_position?: string | null;
  creator_position_ar?: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const OrdersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 13h4l2-6 4 12 2-6h4" />
  </svg>
);

export default function CustomerDetailPage() {
  const { language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const text = useMemo(() => ({
    en: {
      title: "Customer Profile",
      back: "Back to Customers",
      accountInfo: "Account Information",
      contactInfo: "Contact Information",
      companyInfo: "Company Information",
      registeredBy: "Registered By",
      orders: "Orders",
      policies: "Policies",
      activity: "Recent Activity",
      noOrders: "No orders yet",
      noPolicies: "No policies yet",
      noActivity: "No activity yet",
      statusActive: "Active",
      statusInactive: "Inactive",
      typePerson: "Person",
      typeCompany: "Company",
      creditLimit: "Credit Limit",
      preferredLanguage: "Preferred Language",
      lastLogin: "Last Login",
      createdAt: "Created At",
      customerCode: "Customer Code",
      fullName: "Full Name",
      mobile: "Mobile",
      email: "Email",
      phone: "Phone",
      address: "Address",
      companyName: "Company",
      notProvided: "Not provided",
      accountStatus: "Account Status",
      accountDetails: "Account Details",
      languageArabic: "Arabic",
      languageEnglish: "English",
    },
    ar: {
      title: "ملف العميل",
      back: "العودة إلى العملاء",
      accountInfo: "معلومات الحساب",
      contactInfo: "معلومات التواصل",
      companyInfo: "معلومات الشركة",
      registeredBy: "تم التسجيل بواسطة",
      orders: "الطلبات",
      policies: "الوثائق",
      activity: "النشاط الأخير",
      noOrders: "لا توجد طلبات بعد",
      noPolicies: "لا توجد وثائق بعد",
      noActivity: "لا يوجد نشاط بعد",
      statusActive: "نشط",
      statusInactive: "غير نشط",
      typePerson: "فرد",
      typeCompany: "شركة",
      creditLimit: "حد الائتمان",
      preferredLanguage: "اللغة المفضلة",
      lastLogin: "آخر تسجيل دخول",
      createdAt: "تاريخ الإنشاء",
      customerCode: "رمز العميل",
      fullName: "الاسم الكامل",
      mobile: "الجوال",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      address: "العنوان",
      companyName: "الشركة",
      notProvided: "غير متوفر",
      accountStatus: "حالة الحساب",
      accountDetails: "تفاصيل الحساب",
      languageArabic: "العربية",
      languageEnglish: "الإنجليزية",
    },
  }), []);

  const t = text[language];

  const formatDate = (value?: string | null) => {
    if (!value) return t.notProvided;
    const date = new Date(value);
    return new Intl.DateTimeFormat(language === "ar" ? "ar-OM" : "en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return t.notProvided;
    const date = new Date(value);
    return new Intl.DateTimeFormat(language === "ar" ? "ar-OM" : "en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === "ar" ? "ar-OM" : "en-US", {
      style: "currency",
      currency: "OMR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const customerCode = params.id;
    if (!customerCode || !isAuthenticated || authLoading) return;

    const fetchCustomer = async () => {
      try {
        const response = await authenticatedFetch(`/api/customers/${encodeURIComponent(customerCode)}`, {
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Failed to load customer");
          return;
        }

        const data = await response.json();
        if (data.success) {
          setCustomer(data.data);
        } else {
          setError(data.error || "Failed to load customer");
        }
      } catch (err) {
        setError("Failed to load customer");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [params.id, isAuthenticated, authLoading]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/panel/customers")}
            className="px-3 py-2 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors flex items-center gap-2"
          >
            <BackIcon />
            <span>{t.back}</span>
          </button>
        </div>
        <div className="theme-card p-6 text-center text-[var(--foreground-muted)]">
          {error || t.notProvided}
        </div>
      </div>
    );
  }

  const displayName = language === "ar" && customer.full_name_ar ? customer.full_name_ar : customer.full_name || customer.name;

  return (
    <div className="space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push("/panel/customers")}
            className="px-3 py-2 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors flex items-center gap-2 w-fit"
          >
            <BackIcon />
            <span>{t.back}</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{displayName}</h1>
            <p className="text-sm text-[var(--foreground-muted)] font-mono">{customer.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={customer.is_active ? "theme-badge-success" : "theme-badge-error"}>
            {customer.is_active ? t.statusActive : t.statusInactive}
          </span>
          <span className="theme-badge-info">
            {customer.customer_type === "company" ? t.typeCompany : t.typePerson}
          </span>
        </div>
      </div>

      {/* Hero Card */}
      <div className="theme-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            {customer.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={customer.avatar_url}
                alt={displayName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {(displayName || "C")[0]}
                </span>
              </div>
            )}
            <div>
              <div className="text-lg font-semibold text-[var(--foreground)]">{displayName}</div>
              <div className="text-sm text-[var(--foreground-muted)]">{t.accountDetails}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
            <div className="theme-card p-3 bg-[var(--background-secondary)]">
              <div className="text-xs text-[var(--foreground-muted)]">{t.creditLimit}</div>
              <div className="text-sm font-semibold text-[var(--foreground)]">{formatCurrency(customer.credit_limit)}</div>
            </div>
            <div className="theme-card p-3 bg-[var(--background-secondary)]">
              <div className="text-xs text-[var(--foreground-muted)]">{t.preferredLanguage}</div>
              <div className="text-sm font-semibold text-[var(--foreground)]">
                {customer.preferred_language === "ar" ? t.languageArabic : t.languageEnglish}
              </div>
            </div>
            <div className="theme-card p-3 bg-[var(--background-secondary)]">
              <div className="text-xs text-[var(--foreground-muted)]">{t.lastLogin}</div>
              <div className="text-sm font-semibold text-[var(--foreground)]">{formatDateTime(customer.last_login_at)}</div>
            </div>
            <div className="theme-card p-3 bg-[var(--background-secondary)]">
              <div className="text-xs text-[var(--foreground-muted)]">{t.createdAt}</div>
              <div className="text-sm font-semibold text-[var(--foreground)]">{formatDate(customer.created_at)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="theme-card p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">{t.accountInfo}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--foreground-muted)]">{t.customerCode}</label>
                <p className="text-[var(--foreground)] font-medium font-mono">{customer.code}</p>
              </div>
              <div>
                <label className="block text-sm text-[var(--foreground-muted)]">{t.fullName}</label>
                <p className="text-[var(--foreground)] font-medium">{displayName}</p>
              </div>
              <div>
                <label className="block text-sm text-[var(--foreground-muted)]">{t.accountStatus}</label>
                <p className="text-[var(--foreground)] font-medium">
                  {customer.is_active ? t.statusActive : t.statusInactive}
                </p>
              </div>
              <div>
                <label className="block text-sm text-[var(--foreground-muted)]">{t.preferredLanguage}</label>
                <p className="text-[var(--foreground)] font-medium">
                  {customer.preferred_language === "ar" ? t.languageArabic : t.languageEnglish}
                </p>
              </div>
            </div>
          </div>

          <div className="theme-card p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">{t.contactInfo}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--foreground-muted)]">{t.mobile}</label>
                <p className="text-[var(--foreground)] font-medium" dir="ltr">{customer.mobile || t.notProvided}</p>
              </div>
              <div>
                <label className="block text-sm text-[var(--foreground-muted)]">{t.email}</label>
                <p className="text-[var(--foreground)] font-medium">{customer.email || t.notProvided}</p>
              </div>
              <div>
                <label className="block text-sm text-[var(--foreground-muted)]">{t.phone}</label>
                <p className="text-[var(--foreground)] font-medium" dir="ltr">{customer.phone || t.notProvided}</p>
              </div>
              <div>
                <label className="block text-sm text-[var(--foreground-muted)]">{t.address}</label>
                <p className="text-[var(--foreground)] font-medium">{customer.address || t.notProvided}</p>
              </div>
            </div>
          </div>

          <div className="theme-card p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">{t.companyInfo}</h2>
            <div>
              <label className="block text-sm text-[var(--foreground-muted)]">{t.companyName}</label>
              <p className="text-[var(--foreground)] font-medium">{customer.company_name || t.notProvided}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="theme-card p-6">
              <div className="flex items-center gap-2 text-[var(--foreground)] mb-3">
                <OrdersIcon />
                <h3 className="font-semibold">{t.orders}</h3>
              </div>
              <p className="text-sm text-[var(--foreground-muted)]">{t.noOrders}</p>
            </div>
            <div className="theme-card p-6">
              <div className="flex items-center gap-2 text-[var(--foreground)] mb-3">
                <ShieldIcon />
                <h3 className="font-semibold">{t.policies}</h3>
              </div>
              <p className="text-sm text-[var(--foreground-muted)]">{t.noPolicies}</p>
            </div>
          </div>

          <div className="theme-card p-6">
            <div className="flex items-center gap-2 text-[var(--foreground)] mb-3">
              <ActivityIcon />
              <h3 className="font-semibold">{t.activity}</h3>
            </div>
            <p className="text-sm text-[var(--foreground-muted)]">{t.noActivity}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="theme-card p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">{t.registeredBy}</h2>
            {customer.creator_name ? (
              <div className="flex items-center gap-3">
                {customer.creator_avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={customer.creator_avatar_url}
                    alt={customer.creator_name || ""}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center">
                    <span className="text-white text-base font-bold">
                      {(language === "ar" && customer.creator_name_ar ? customer.creator_name_ar : customer.creator_name || "U")[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-[var(--foreground)] font-semibold">
                    {language === "ar" && customer.creator_name_ar ? customer.creator_name_ar : customer.creator_name}
                  </p>
                  {(customer.creator_position || customer.creator_position_ar) && (
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {language === "ar" && customer.creator_position_ar ? customer.creator_position_ar : customer.creator_position}
                    </p>
                  )}
                  {customer.creator_email && (
                    <p className="text-xs text-[var(--foreground-muted)]">{customer.creator_email}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--foreground-muted)]">{t.notProvided}</p>
            )}
          </div>

          <div className="theme-card p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">{t.accountInfo}</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--foreground-muted)]">{t.createdAt}</span>
                <span className="text-[var(--foreground)] font-medium">{formatDate(customer.created_at)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--foreground-muted)]">{t.lastLogin}</span>
                <span className="text-[var(--foreground)] font-medium">{formatDateTime(customer.last_login_at)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--foreground-muted)]">{t.creditLimit}</span>
                <span className="text-[var(--foreground)] font-medium">{formatCurrency(customer.credit_limit)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
