"use client";

/**
 * Settings Page
 * System settings and profile management
 */

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import { PermissionGate } from "@/lib/permissions/client";
import { useAppearance } from "@/lib/settings";
import { ThemeSelectorCards } from "@/components/ThemeToggle";
import { authenticatedFetch } from "@/lib/auth/AuthContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useNotifications } from "@/lib/notifications/NotificationContext";

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

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Backup type interface
interface Backup {
  filename: string;
  type: string;
  date: string;
  time: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
}

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
          ? "bg-[var(--primary-light)] text-[var(--primary)]"
          : "text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)]"
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
  const { isPushEnabled, subscribeToPush, unsubscribeFromPush } = useNotifications();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [profileForm, setProfileForm] = useState({
    full_name: "System Administrator",
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
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  const appInfo = {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Ameen Hub",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    build: process.env.NEXT_PUBLIC_BUILD_NUMBER || "dev",
    buildDate: process.env.NEXT_PUBLIC_BUILD_DATE || "local",
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || (process.env.NODE_ENV === "production" ? "Production" : "Development"),
    nextVersion: process.env.NEXT_PUBLIC_NEXT_VERSION || "16.x",
    nodeVersion: process.env.NEXT_PUBLIC_NODE_VERSION || "20.x",
    database: process.env.NEXT_PUBLIC_DB_ENGINE || "PostgreSQL",
    storage: process.env.NEXT_PUBLIC_STORAGE || "Local Filesystem",
  };

  useEffect(() => {
    const storedMode = localStorage.getItem("maintenanceMode");
    const storedMessage = localStorage.getItem("maintenanceMessage");
    setMaintenanceMode(storedMode === "true");
    setMaintenanceMessage(storedMessage || "");
  }, []);

  const handleMaintenanceToggle = (enabled: boolean) => {
    setMaintenanceMode(enabled);
    localStorage.setItem("maintenanceMode", String(enabled));
    window.dispatchEvent(new Event("maintenanceChanged"));
  };

  const handleMaintenanceMessageChange = (value: string) => {
    setMaintenanceMessage(value);
    localStorage.setItem("maintenanceMessage", value);
    window.dispatchEvent(new Event("maintenanceChanged"));
  };

  // Backup state
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);
  const [backupType, setBackupType] = useState<'full' | 'db' | 'files'>('full');
  const [confirmRestore, setConfirmRestore] = useState<Backup | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Backup | null>(null);
  const [restoreOptions, setRestoreOptions] = useState({ db: true, files: true });

  // Fetch backups
  const fetchBackups = useCallback(async () => {
    setLoadingBackups(true);
    try {
      const response = await authenticatedFetch('/api/backup');
      const data = await response.json();
      if (data.success) {
        setBackups(data.data);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    } finally {
      setLoadingBackups(false);
    }
  }, []);

  // Load backups when system tab is active
  useEffect(() => {
    if (activeTab === 'system') {
      fetchBackups();
    }
  }, [activeTab, fetchBackups]);

  // Create backup
  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      const response = await authenticatedFetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: backupType }),
      });
      const data = await response.json();
      if (data.success) {
        alert(language === 'ar' ? 'تم إنشاء النسخة الاحتياطية بنجاح' : 'Backup created successfully');
        fetchBackups();
      } else {
        alert(data.error || (language === 'ar' ? 'فشل إنشاء النسخة الاحتياطية' : 'Failed to create backup'));
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء إنشاء النسخة الاحتياطية' : 'Error creating backup');
    } finally {
      setCreatingBackup(false);
    }
  };

  // Download backup
  const handleDownloadBackup = async (backup: Backup) => {
    try {
      const response = await authenticatedFetch(`/api/backup/${backup.filename}`);
      if (!response.ok) {
        throw new Error('Download failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading backup:', error);
      alert(language === 'ar' ? 'فشل تحميل النسخة الاحتياطية' : 'Failed to download backup');
    }
  };

  // Delete backup
  const handleDeleteBackup = async () => {
    if (!confirmDelete) return;
    try {
      const response = await authenticatedFetch(`/api/backup/${confirmDelete.filename}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchBackups();
      } else {
        alert(data.error || (language === 'ar' ? 'فشل حذف النسخة الاحتياطية' : 'Failed to delete backup'));
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء حذف النسخة الاحتياطية' : 'Error deleting backup');
    } finally {
      setConfirmDelete(null);
    }
  };

  // Restore backup
  const handleRestoreBackup = async () => {
    if (!confirmRestore) return;
    setRestoringBackup(true);
    try {
      const response = await authenticatedFetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: confirmRestore.filename,
          restoreDb: restoreOptions.db,
          restoreFiles: restoreOptions.files,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(language === 'ar' ? 'تمت الاستعادة بنجاح' : data.message || 'Restore completed successfully');
      } else {
        alert(data.error || (language === 'ar' ? 'فشلت عملية الاستعادة' : 'Restore failed'));
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء الاستعادة' : 'Error during restore');
    } finally {
      setRestoringBackup(false);
      setConfirmRestore(null);
    }
  };

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
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          {language === "ar" ? "الإعدادات" : "Settings"}
        </h1>
        <p className="text-[var(--foreground-muted)] mt-1">
          {language === "ar" ? "إدارة إعدادات حسابك والنظام" : "Manage your account and system settings"}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-[var(--card)] rounded-xl shadow-[var(--shadow)] border border-[var(--card-border)] p-2">
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
          <div className="bg-[var(--card)] rounded-xl shadow-[var(--shadow)] border border-[var(--card-border)]">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  {language === "ar" ? "معلومات الملف الشخصي" : "Profile Information"}
                </h2>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                    {t.users.fullName}
                  </label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="theme-input w-full"
                  />
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
                    {language === "ar" ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="theme-input w-full"
                  />
                </div>

                <div className="pt-4 border-t border-[var(--card-border)]">
                  <button
                    type="submit"
                    className="theme-btn theme-btn-primary"
                  >
                    {t.common.save}
                  </button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <form onSubmit={handleChangePassword} className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  {language === "ar" ? "تغيير كلمة المرور" : "Change Password"}
                </h2>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                    {language === "ar" ? "كلمة المرور الحالية" : "Current Password"}
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="theme-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                    {language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
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
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    className="theme-input w-full"
                  />
                </div>

                <div className="pt-4 border-t border-[var(--card-border)]">
                  <button
                    type="submit"
                    className="theme-btn theme-btn-primary"
                  >
                    {language === "ar" ? "تغيير كلمة المرور" : "Change Password"}
                  </button>
                </div>
              </form>
            )}

            {/* Language Tab */}
            {activeTab === "language" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  {language === "ar" ? "إعدادات اللغة" : "Language Settings"}
                </h2>

                <div className="space-y-4">
                  <label
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      language === "en"
                        ? "border-[var(--primary)] bg-[var(--primary-light)]"
                        : "border-[var(--card-border)] hover:border-[var(--foreground-muted)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      checked={language === "en"}
                      onChange={() => setLanguage("en")}
                      className="w-4 h-4 text-[var(--primary)]"
                    />
                    <div>
                      <p className="font-medium text-[var(--foreground)]">English</p>
                      <p className="text-sm text-[var(--foreground-muted)]">Use English as the interface language</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      language === "ar"
                        ? "border-[var(--primary)] bg-[var(--primary-light)]"
                        : "border-[var(--card-border)] hover:border-[var(--foreground-muted)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      checked={language === "ar"}
                      onChange={() => setLanguage("ar")}
                      className="w-4 h-4 text-[var(--primary)]"
                    />
                    <div>
                      <p className="font-medium text-[var(--foreground)]">العربية</p>
                      <p className="text-sm text-[var(--foreground-muted)]">استخدام اللغة العربية كلغة الواجهة</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  {language === "ar" ? "إعدادات الإشعارات" : "Notification Settings"}
                </h2>

                {/* Push Notifications */}
                <div className="p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--card-border)]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--foreground)]">
                          {language === "ar" ? "إشعارات الدفع" : "Push Notifications"}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          isPushEnabled 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {isPushEnabled 
                            ? (language === "ar" ? "مفعّل" : "Enabled")
                            : (language === "ar" ? "معطّل" : "Disabled")
                          }
                        </span>
                      </div>
                      <p className="text-sm text-[var(--foreground-muted)] mt-1">
                        {language === "ar" 
                          ? "تلقي إشعارات فورية في المتصفح حتى عند إغلاق التطبيق" 
                          : "Receive instant browser notifications even when the app is closed"}
                      </p>
                    </div>
                    <button
                      onClick={() => isPushEnabled ? unsubscribeFromPush() : subscribeToPush()}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isPushEnabled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                          : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
                      }`}
                    >
                      {isPushEnabled 
                        ? (language === "ar" ? "تعطيل" : "Disable")
                        : (language === "ar" ? "تفعيل" : "Enable")
                      }
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: "email_notifications", label: language === "ar" ? "إشعارات البريد الإلكتروني" : "Email Notifications", desc: language === "ar" ? "تلقي الإشعارات عبر البريد الإلكتروني" : "Receive notifications via email" },
                    { key: "sms_notifications", label: language === "ar" ? "إشعارات الرسائل القصيرة" : "SMS Notifications", desc: language === "ar" ? "تلقي الإشعارات عبر الرسائل القصيرة" : "Receive notifications via SMS" },
                    { key: "weekly_report", label: language === "ar" ? "التقرير الأسبوعي" : "Weekly Report", desc: language === "ar" ? "تلقي ملخص أسبوعي للنشاط" : "Receive weekly activity summary" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-[var(--background-secondary)]">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{item.label}</p>
                        <p className="text-sm text-[var(--foreground-muted)]">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[var(--input-border)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  {language === "ar" ? "إعدادات المظهر" : "Appearance Settings"}
                </h2>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-4">
                    {language === "ar" ? "اختر السمة" : "Choose Theme"}
                  </label>
                  <ThemeSelectorCards language={language} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--background-secondary)]">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {language === "ar" ? "الشريط الجانبي المضغوط" : "Compact Sidebar"}
                    </p>
                    <p className="text-sm text-[var(--foreground-muted)]">
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
                    <div className="w-11 h-6 bg-[var(--input-border)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                  </label>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === "system" && (
              <PermissionGate permission="settings.manage">
                <div className="p-6 space-y-6">
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">
                    {language === "ar" ? "إعدادات النظام" : "System Settings"}
                  </h2>

                  <div className="theme-alert theme-alert-warning">
                    <p className="text-sm">
                      {language === "ar"
                        ? "⚠️ تحذير: تغيير هذه الإعدادات قد يؤثر على عمل النظام بالكامل."
                        : "⚠️ Warning: Changing these settings may affect the entire system."}
                    </p>
                  </div>

                  {/* Backup & Restore Section */}
                  <div className="space-y-4">
                    <h3 className="text-md font-semibold text-[var(--foreground)] flex items-center gap-2">
                      <DatabaseIcon />
                      {language === "ar" ? "النسخ الاحتياطي والاستعادة" : "Backup & Restore"}
                    </h3>

                    {/* Create Backup */}
                    <div className="p-4 rounded-lg bg-[var(--background-secondary)]">
                      <p className="font-medium text-[var(--foreground)] mb-4">
                        {language === "ar" ? "إنشاء نسخة احتياطية جديدة" : "Create New Backup"}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="backupType"
                            value="full"
                            checked={backupType === 'full'}
                            onChange={() => setBackupType('full')}
                            className="w-4 h-4 text-[var(--primary)]"
                          />
                          <span className="text-sm text-[var(--foreground)]">
                            {language === "ar" ? "كامل (قاعدة البيانات + الملفات)" : "Full (Database + Files)"}
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="backupType"
                            value="db"
                            checked={backupType === 'db'}
                            onChange={() => setBackupType('db')}
                            className="w-4 h-4 text-[var(--primary)]"
                          />
                          <span className="text-sm text-[var(--foreground)]">
                            {language === "ar" ? "قاعدة البيانات فقط" : "Database Only"}
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="backupType"
                            value="files"
                            checked={backupType === 'files'}
                            onChange={() => setBackupType('files')}
                            className="w-4 h-4 text-[var(--primary)]"
                          />
                          <span className="text-sm text-[var(--foreground)]">
                            {language === "ar" ? "الملفات فقط" : "Files Only"}
                          </span>
                        </label>
                      </div>

                      <button
                        onClick={handleCreateBackup}
                        disabled={creatingBackup}
                        className="theme-btn theme-btn-primary flex items-center gap-2"
                      >
                        {creatingBackup ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {language === "ar" ? "جاري الإنشاء..." : "Creating..."}
                          </>
                        ) : (
                          <>
                            <DownloadIcon />
                            {language === "ar" ? "إنشاء نسخة احتياطية" : "Create Backup"}
                          </>
                        )}
                      </button>
                    </div>

                    {/* Backup List */}
                    <div className="p-4 rounded-lg bg-[var(--background-secondary)]">
                      <div className="flex items-center justify-between mb-4">
                        <p className="font-medium text-[var(--foreground)]">
                          {language === "ar" ? "النسخ الاحتياطية المتوفرة" : "Available Backups"}
                        </p>
                        <button
                          onClick={fetchBackups}
                          disabled={loadingBackups}
                          className="p-2 rounded-lg hover:bg-[var(--background)] transition-colors"
                          title={language === "ar" ? "تحديث" : "Refresh"}
                        >
                          <RefreshIcon />
                        </button>
                      </div>

                      {loadingBackups ? (
                        <div className="flex items-center justify-center py-8">
                          <svg className="animate-spin w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : backups.length === 0 ? (
                        <p className="text-sm text-[var(--foreground-muted)] text-center py-8">
                          {language === "ar" ? "لا توجد نسخ احتياطية متوفرة" : "No backups available"}
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {backups.map((backup) => (
                            <div
                              key={backup.filename}
                              className="flex items-center justify-between p-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)]"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                                  {backup.filename}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-[var(--foreground-muted)]">
                                  <span className={`px-2 py-0.5 rounded-full ${
                                    backup.type === 'full' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    backup.type === 'db' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                  }`}>
                                    {backup.type === 'full' ? (language === 'ar' ? 'كامل' : 'Full') :
                                     backup.type === 'db' ? (language === 'ar' ? 'قاعدة بيانات' : 'Database') :
                                     (language === 'ar' ? 'ملفات' : 'Files')}
                                  </span>
                                  <span>{backup.date}</span>
                                  <span>{backup.time}</span>
                                  <span>{backup.sizeFormatted}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ms-4">
                                <button
                                  onClick={() => handleDownloadBackup(backup)}
                                  className="p-2 rounded-lg hover:bg-[var(--background-secondary)] text-[var(--primary)] transition-colors"
                                  title={language === "ar" ? "تحميل" : "Download"}
                                >
                                  <DownloadIcon />
                                </button>
                                <button
                                  onClick={() => {
                                    setRestoreOptions({ 
                                      db: backup.type !== 'files', 
                                      files: backup.type !== 'db' 
                                    });
                                    setConfirmRestore(backup);
                                  }}
                                  className="p-2 rounded-lg hover:bg-[var(--background-secondary)] text-[var(--warning)] transition-colors"
                                  title={language === "ar" ? "استعادة" : "Restore"}
                                >
                                  <UploadIcon />
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(backup)}
                                  className="p-2 rounded-lg hover:bg-[var(--background-secondary)] text-red-500 transition-colors"
                                  title={language === "ar" ? "حذف" : "Delete"}
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-[var(--background-secondary)]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[var(--foreground)]">
                            {language === "ar" ? "وضع الصيانة" : "Maintenance Mode"}
                          </p>
                          <p className="text-sm text-[var(--foreground-muted)]">
                            {language === "ar" ? "تعطيل الوصول للمستخدمين العاديين" : "Disable access for regular users"}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={maintenanceMode}
                            onChange={(e) => handleMaintenanceToggle(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[var(--input-border)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                        </label>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                          {language === "ar" ? "نص الشريط العلوي" : "Top Bar Message"}
                        </label>
                        <textarea
                          rows={2}
                          value={maintenanceMessage}
                          onChange={(e) => handleMaintenanceMessageChange(e.target.value)}
                          placeholder={
                            language === "ar"
                              ? "مثال: النظام تحت الصيانة حالياً. قد تتأثر بعض الخدمات."
                              : "Example: The system is under maintenance. Some services may be impacted."
                          }
                          className="theme-input w-full"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[var(--background-secondary)]">
                      <p className="font-medium text-[var(--foreground)] mb-2">
                        {language === "ar" ? "معلومات البرنامج" : "Application Information"}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-[var(--foreground-muted)]">
                            {language === "ar" ? "اسم النظام:" : "App Name:"}
                          </span>
                          <span className="ms-2 text-[var(--foreground)]">{appInfo.name}</span>
                        </div>
                        <div>
                          <span className="text-[var(--foreground-muted)]">
                            {language === "ar" ? "إصدار النظام:" : "App Version:"}
                          </span>
                          <span className="ms-2 text-[var(--foreground)]">{appInfo.version}</span>
                        </div>
                        <div>
                          <span className="text-[var(--foreground-muted)]">
                            {language === "ar" ? "رقم الإصدار:" : "Build Number:"}
                          </span>
                          <span className="ms-2 text-[var(--foreground)]">{appInfo.build}</span>
                        </div>
                        <div>
                          <span className="text-[var(--foreground-muted)]">
                            {language === "ar" ? "تاريخ البناء:" : "Build Date:"}
                          </span>
                          <span className="ms-2 text-[var(--foreground)]">{appInfo.buildDate}</span>
                        </div>
                        <div>
                          <span className="text-[var(--foreground-muted)]">
                            {language === "ar" ? "البيئة:" : "Environment:"}
                          </span>
                          <span className="ms-2 text-[var(--foreground)]">{appInfo.environment}</span>
                        </div>
                        <div>
                          <span className="text-[var(--foreground-muted)]">
                            {language === "ar" ? "محرك قاعدة البيانات:" : "Database Engine:"}
                          </span>
                          <span className="ms-2 text-[var(--foreground)]">{appInfo.database}</span>
                        </div>
                        <div>
                          <span className="text-[var(--foreground-muted)]">Node.js:</span>
                          <span className="ms-2 text-[var(--foreground)]">v{appInfo.nodeVersion}</span>
                        </div>
                        <div>
                          <span className="text-[var(--foreground-muted)]">Next.js:</span>
                          <span className="ms-2 text-[var(--foreground)]">v{appInfo.nextVersion}</span>
                        </div>
                        <div>
                          <span className="text-[var(--foreground-muted)]">
                            {language === "ar" ? "التخزين:" : "Storage:"}
                          </span>
                          <span className="ms-2 text-[var(--foreground)]">{appInfo.storage}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[var(--background-secondary)]">
                      <p className="font-medium text-[var(--foreground)] mb-4">
                        {language === "ar" ? "إجراءات الصيانة" : "Maintenance Actions"}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button className="theme-btn theme-btn-primary">
                          {language === "ar" ? "مزامنة الصلاحيات" : "Sync Permissions"}
                        </button>
                        <button className="px-4 py-2 text-sm bg-[var(--warning)] text-white rounded-lg hover:opacity-90 transition-colors">
                          {language === "ar" ? "مسح الذاكرة المؤقتة" : "Clear Cache"}
                        </button>
                        <button className="theme-btn theme-btn-danger">
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteBackup}
        title={language === "ar" ? "حذف النسخة الاحتياطية" : "Delete Backup"}
        message={
          language === "ar"
            ? `هل أنت متأكد من حذف "${confirmDelete?.filename}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete "${confirmDelete?.filename}"? This action cannot be undone.`
        }
        confirmText={language === "ar" ? "حذف" : "Delete"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        variant="danger"
      />

      {/* Confirm Restore Dialog */}
      {confirmRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--card)] rounded-xl shadow-xl max-w-md w-full mx-4 p-6" dir={language === "ar" ? "rtl" : "ltr"}>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              {language === "ar" ? "استعادة النسخة الاحتياطية" : "Restore Backup"}
            </h3>
            
            <div className="theme-alert theme-alert-warning mb-4">
              <p className="text-sm">
                {language === "ar"
                  ? "⚠️ تحذير: ستؤدي الاستعادة إلى استبدال البيانات الحالية. تأكد من إنشاء نسخة احتياطية أولاً."
                  : "⚠️ Warning: Restore will overwrite current data. Make sure to create a backup first."}
              </p>
            </div>

            <p className="text-sm text-[var(--foreground-muted)] mb-4">
              {language === "ar" ? `الملف: ${confirmRestore.filename}` : `File: ${confirmRestore.filename}`}
            </p>

            {confirmRestore.type === 'full' && (
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {language === "ar" ? "اختر ما تريد استعادته:" : "Select what to restore:"}
                </p>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={restoreOptions.db}
                    onChange={(e) => setRestoreOptions({ ...restoreOptions, db: e.target.checked })}
                    className="w-4 h-4 text-[var(--primary)] rounded"
                  />
                  <span className="text-sm text-[var(--foreground)]">
                    {language === "ar" ? "قاعدة البيانات" : "Database"}
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={restoreOptions.files}
                    onChange={(e) => setRestoreOptions({ ...restoreOptions, files: e.target.checked })}
                    className="w-4 h-4 text-[var(--primary)] rounded"
                  />
                  <span className="text-sm text-[var(--foreground)]">
                    {language === "ar" ? "الملفات المرفوعة" : "Uploaded Files"}
                  </span>
                </label>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmRestore(null)}
                className="theme-btn theme-btn-secondary"
                disabled={restoringBackup}
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleRestoreBackup}
                disabled={restoringBackup || (!restoreOptions.db && !restoreOptions.files)}
                className="px-4 py-2 text-sm bg-[var(--warning)] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {restoringBackup ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {language === "ar" ? "جاري الاستعادة..." : "Restoring..."}
                  </>
                ) : (
                  <>
                    <UploadIcon />
                    {language === "ar" ? "استعادة" : "Restore"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
