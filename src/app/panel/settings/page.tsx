"use client";

/**
 * Settings Page
 * System settings and profile management
 */

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import { PermissionGate } from "@/lib/permissions/client";
import { useAppearance } from "@/lib/settings";

// Icons
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const PaletteIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

type TabType = "profile" | "password" | "language" | "notifications" | "appearance" | "system";

interface SettingsTabProps {
  id: TabType;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function SettingsTab({ icon, label, active, onClick }: SettingsTabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
        active
          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const { appearance, setTheme, setCompactSidebar } = useAppearance();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [profileForm, setProfileForm] = useState({
    first_name: "Admin",
    last_name: "User",
    email: "admin@ameenhub.com",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    weekly_report: true,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile save
    alert(language === "ar" ? "تم حفظ الملف الشخصي" : "Profile saved");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert(language === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }
    // TODO: Implement password change
    alert(language === "ar" ? "تم تغيير كلمة المرور" : "Password changed");
    setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
  };

  const tabs: { id: TabType; icon: React.ReactNode; label: string; permission?: string }[] = [
    { id: "profile", icon: <UserIcon />, label: language === "ar" ? "الملف الشخصي" : "Profile" },
    { id: "password", icon: <LockIcon />, label: language === "ar" ? "كلمة المرور" : "Password" },
    { id: "language", icon: <GlobeIcon />, label: language === "ar" ? "اللغة" : "Language" },
    { id: "notifications", icon: <BellIcon />, label: language === "ar" ? "الإشعارات" : "Notifications" },
    { id: "appearance", icon: <PaletteIcon />, label: language === "ar" ? "المظهر" : "Appearance" },
    { id: "system", icon: <DatabaseIcon />, label: language === "ar" ? "النظام" : "System", permission: "settings.manage" },
  ];

  return (
    <div className="space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {language === "ar" ? "الإعدادات" : "Settings"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {language === "ar" ? "إدارة إعدادات حسابك والنظام" : "Manage your account and system settings"}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
            <nav className="space-y-1">
              {tabs.map((tab) =>
                tab.permission ? (
                  <PermissionGate key={tab.id} permission={tab.permission}>
                    <SettingsTab
                      id={tab.id}
                      icon={tab.icon}
                      label={tab.label}
                      active={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                    />
                  </PermissionGate>
                ) : (
                  <SettingsTab
                    key={tab.id}
                    id={tab.id}
                    icon={tab.icon}
                    label={tab.label}
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  />
                )
              )}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {language === "ar" ? "معلومات الملف الشخصي" : "Profile Information"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "الاسم الأول" : "First Name"}
                    </label>
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "الاسم الأخير" : "Last Name"}
                    </label>
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === "ar" ? "البريد الإلكتروني" : "Email"}
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === "ar" ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t.common.save}
                  </button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <form onSubmit={handleChangePassword} className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {language === "ar" ? "تغيير كلمة المرور" : "Change Password"}
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === "ar" ? "كلمة المرور الحالية" : "Current Password"}
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {language === "ar" ? "تغيير كلمة المرور" : "Change Password"}
                  </button>
                </div>
              </form>
            )}

            {/* Language Tab */}
            {activeTab === "language" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {language === "ar" ? "إعدادات اللغة" : "Language Settings"}
                </h2>

                <div className="space-y-4">
                  <label
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      language === "en"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      checked={language === "en"}
                      onChange={() => setLanguage("en")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">English</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Use English as the interface language</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      language === "ar"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      checked={language === "ar"}
                      onChange={() => setLanguage("ar")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">العربية</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">استخدام اللغة العربية كلغة الواجهة</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {language === "ar" ? "إعدادات الإشعارات" : "Notification Settings"}
                </h2>

                <div className="space-y-4">
                  {[
                    { key: "email_notifications", label: language === "ar" ? "إشعارات البريد الإلكتروني" : "Email Notifications", desc: language === "ar" ? "تلقي الإشعارات عبر البريد الإلكتروني" : "Receive notifications via email" },
                    { key: "push_notifications", label: language === "ar" ? "إشعارات الدفع" : "Push Notifications", desc: language === "ar" ? "تلقي إشعارات الدفع في المتصفح" : "Receive push notifications in browser" },
                    { key: "sms_notifications", label: language === "ar" ? "إشعارات الرسائل القصيرة" : "SMS Notifications", desc: language === "ar" ? "تلقي الإشعارات عبر الرسائل القصيرة" : "Receive notifications via SMS" },
                    { key: "weekly_report", label: language === "ar" ? "التقرير الأسبوعي" : "Weekly Report", desc: language === "ar" ? "تلقي ملخص أسبوعي للنشاط" : "Receive weekly activity summary" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{item.label}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {language === "ar" ? "إعدادات المظهر" : "Appearance Settings"}
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {language === "ar" ? "السمة" : "Theme"}
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {(["light", "dark", "system"] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setTheme(theme)}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          appearance.theme === theme
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <p className="font-medium text-gray-800 dark:text-white capitalize">
                          {theme === "light"
                            ? language === "ar" ? "فاتح" : "Light"
                            : theme === "dark"
                            ? language === "ar" ? "داكن" : "Dark"
                            : language === "ar" ? "النظام" : "System"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {language === "ar" ? "الشريط الجانبي المضغوط" : "Compact Sidebar"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {language === "ar" ? "عرض الشريط الجانبي بشكل مضغوط" : "Show sidebar in compact mode"}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appearance.compactSidebar}
                      onChange={(e) => setCompactSidebar(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === "system" && (
              <PermissionGate permission="settings.manage">
                <div className="p-6 space-y-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {language === "ar" ? "إعدادات النظام" : "System Settings"}
                  </h2>

                  <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {language === "ar"
                        ? "⚠️ تحذير: تغيير هذه الإعدادات قد يؤثر على عمل النظام بالكامل."
                        : "⚠️ Warning: Changing these settings may affect the entire system."}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {language === "ar" ? "وضع الصيانة" : "Maintenance Mode"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {language === "ar" ? "تعطيل الوصول للمستخدمين العاديين" : "Disable access for regular users"}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                      <p className="font-medium text-gray-800 dark:text-white mb-2">
                        {language === "ar" ? "معلومات النظام" : "System Information"}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            {language === "ar" ? "الإصدار:" : "Version:"}
                          </span>
                          <span className="ml-2 text-gray-800 dark:text-white">1.0.0</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            {language === "ar" ? "البيئة:" : "Environment:"}
                          </span>
                          <span className="ml-2 text-gray-800 dark:text-white">Development</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Node.js:</span>
                          <span className="ml-2 text-gray-800 dark:text-white">v20.x</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Next.js:</span>
                          <span className="ml-2 text-gray-800 dark:text-white">15.x</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                      <p className="font-medium text-gray-800 dark:text-white mb-4">
                        {language === "ar" ? "إجراءات الصيانة" : "Maintenance Actions"}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          {language === "ar" ? "مزامنة الصلاحيات" : "Sync Permissions"}
                        </button>
                        <button className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                          {language === "ar" ? "مسح الذاكرة المؤقتة" : "Clear Cache"}
                        </button>
                        <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          {language === "ar" ? "إعادة تعيين الجلسات" : "Reset Sessions"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </PermissionGate>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
