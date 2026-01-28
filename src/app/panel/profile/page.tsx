"use client";

/**
 * Profile Page
 * User profile details and account info with avatar upload
 */

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import { AvatarUpload } from "@/components/upload";
import { UploadResult } from "@/lib/upload";

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

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SuccessIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function ProfilePage() {
  const { language } = useLanguage();
  const t = translations[language];

  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  
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

  const handleAvatarUpload = (result: UploadResult) => {
    if (result.success && result.url) {
      setAvatarUrl(result.url);
      showSuccessMessage();
    }
  };

  const handleAvatarRemove = () => {
    setAvatarUrl("");
  };

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccessMessage();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.new_password !== securityForm.confirm_password) {
      alert(language === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }
    showSuccessMessage();
    setSecurityForm({ current_password: "", new_password: "", confirm_password: "" });
  };

  return (
    <div className="space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--success)] text-white shadow-lg">
            <SuccessIcon />
            <span className="font-medium">
              {language === "ar" ? "تم الحفظ بنجاح" : "Saved successfully"}
            </span>
          </div>
        </div>
      )}

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
              {/* Avatar Upload Component */}
              <AvatarUpload
                currentImage={avatarUrl}
                initials={`${profileForm.first_name.charAt(0)}${profileForm.last_name.charAt(0)}`}
                size="xl"
                onUpload={handleAvatarUpload}
                onRemove={handleAvatarRemove}
                language={language}
                showRemoveButton={!!avatarUrl}
              />
              
              <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                {profileForm.first_name} {profileForm.last_name}
              </h2>
              <p className="text-sm text-[var(--foreground-muted)]">{profileForm.email}</p>
              <p className="text-sm text-[var(--foreground-muted)] mt-2">{profileForm.bio}</p>

              {/* Stats */}
              <div className="mt-6 w-full space-y-2 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-secondary)]">
                  <span className="text-[var(--foreground-secondary)]">
                    {language === "ar" ? "الحالة" : "Status"}
                  </span>
                  <span className="theme-badge-success">
                    {language === "ar" ? "نشط" : "Active"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-secondary)]">
                  <span className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                    <ShieldIcon />
                    {language === "ar" ? "الدور" : "Role"}
                  </span>
                  <span className="theme-badge-primary">
                    {language === "ar" ? "مدير" : "Admin"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-secondary)]">
                  <span className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                    <MailIcon />
                    {language === "ar" ? "البريد" : "Email"}
                  </span>
                  <span className="text-[var(--foreground-secondary)] text-xs">{profileForm.email}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-secondary)]">
                  <span className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                    <PhoneIcon />
                    {language === "ar" ? "الهاتف" : "Phone"}
                  </span>
                  <span className="text-[var(--foreground-secondary)] text-xs" dir="ltr">{profileForm.phone}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-secondary)]">
                  <span className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                    <CalendarIcon />
                    {language === "ar" ? "تاريخ الانضمام" : "Joined"}
                  </span>
                  <span className="text-[var(--foreground-secondary)] text-xs">
                    {new Date().toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                  </span>
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
