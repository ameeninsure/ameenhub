"use client";

/**
 * Profile Page
 * User profile details and account info
 */

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";

const CameraIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h4l2-3h6l2 3h4v12H3V7zm9 9a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l8 4v5c0 5-3.5 9-8 9s-8-4-8-9V7l8-4z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16v12H4V6zm0 0l8 6 8-6" />
  </svg>
);

export default function ProfilePage() {
  const { language } = useLanguage();
  const t = translations[language];

  const [profileForm, setProfileForm] = useState({
    first_name: "Admin",
    last_name: "User",
    email: "admin@ameenhub.com",
    phone: "+98 912 000 0000",
    bio: language === "ar" ? "مدير النظام" : "System administrator",
  });

  const [securityForm, setSecurityForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert(language === "ar" ? "تم حفظ الملف الشخصي" : "Profile saved");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.new_password !== securityForm.confirm_password) {
      alert(language === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }
    alert(language === "ar" ? "تم تغيير كلمة المرور" : "Password changed");
    setSecurityForm({ current_password: "", new_password: "", confirm_password: "" });
  };

  return (
    <div className="space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          {language === "ar" ? "الملف الشخصي" : "Profile"}
        </h1>
        <p className="text-[var(--foreground-muted)] mt-1">
          {language === "ar" ? "إدارة بيانات حسابك" : "Manage your account details"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="theme-card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center text-2xl font-bold">
                  {profileForm.first_name.charAt(0)}{profileForm.last_name.charAt(0)}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--card)] border border-[var(--card-border)] flex items-center justify-center text-[var(--foreground-secondary)] hover:bg-[var(--card-hover)]"
                >
                  <CameraIcon />
                </button>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                {profileForm.first_name} {profileForm.last_name}
              </h2>
              <p className="text-sm text-[var(--foreground-muted)]">{profileForm.email}</p>
              <p className="text-sm text-[var(--foreground-muted)] mt-2">{profileForm.bio}</p>

              <div className="mt-4 w-full space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--background-secondary)]">
                  <span className="text-[var(--foreground-secondary)]">
                    {language === "ar" ? "الحالة" : "Status"}
                  </span>
                  <span className="text-[var(--success)]">
                    {language === "ar" ? "نشط" : "Active"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--background-secondary)]">
                  <span className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                    <ShieldIcon />
                    {language === "ar" ? "الدور" : "Role"}
                  </span>
                  <span className="text-[var(--foreground-secondary)]">
                    {language === "ar" ? "مدير" : "Admin"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--background-secondary)]">
                  <span className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                    <MailIcon />
                    {language === "ar" ? "البريد" : "Email"}
                  </span>
                  <span className="text-[var(--foreground-secondary)]">{profileForm.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile info */}
          <form onSubmit={handleSaveProfile} className="theme-card p-6 space-y-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              {language === "ar" ? "معلومات الحساب" : "Account Information"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  {language === "ar" ? "الاسم الأول" : "First Name"}
                </label>
                <input
                  type="text"
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  className="theme-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  {language === "ar" ? "الاسم الأخير" : "Last Name"}
                </label>
                <input
                  type="text"
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                  className="theme-input w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {language === "ar" ? "البريد الإلكتروني" : "Email"}
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="theme-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {language === "ar" ? "رقم الهاتف" : "Phone"}
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="theme-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {language === "ar" ? "نبذة" : "Bio"}
              </label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="theme-input w-full"
              />
            </div>
            <div className="pt-4 border-t border-[var(--card-border)]">
              <button type="submit" className="theme-btn-primary">
                {t.common.save}
              </button>
            </div>
          </form>

          {/* Security */}
          <form onSubmit={handleChangePassword} className="theme-card p-6 space-y-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              {language === "ar" ? "الأمان" : "Security"}
            </h3>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {language === "ar" ? "كلمة المرور الحالية" : "Current Password"}
              </label>
              <input
                type="password"
                required
                value={securityForm.current_password}
                onChange={(e) => setSecurityForm({ ...securityForm, current_password: e.target.value })}
                className="theme-input w-full"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  {language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                </label>
                <input
                  type="password"
                  required
                  value={securityForm.new_password}
                  onChange={(e) => setSecurityForm({ ...securityForm, new_password: e.target.value })}
                  className="theme-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  {language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                </label>
                <input
                  type="password"
                  required
                  value={securityForm.confirm_password}
                  onChange={(e) => setSecurityForm({ ...securityForm, confirm_password: e.target.value })}
                  className="theme-input w-full"
                />
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--card-border)]">
              <button type="submit" className="theme-btn-primary">
                {language === "ar" ? "تحديث كلمة المرور" : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
