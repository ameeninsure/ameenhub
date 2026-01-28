"use client";

/**
 * Panel Header Component
 * Top header for the admin panel with user menu, notifications, theme toggle, and language switcher
 */

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { usePermissions } from "@/lib/permissions/client";
import { ThemeToggle } from "@/components/ThemeToggle";

// Icons
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

interface PanelHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onMobileMenuClick: () => void;
}

export function PanelHeader({
  sidebarOpen,
  onToggleSidebar,
  onMobileMenuClick,
}: PanelHeaderProps) {
  const { language, setLanguage } = useLanguage();
  const { user } = usePermissions();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const userName = user 
    ? `${user.first_name} ${user.last_name}` 
    : language === "ar" ? "المستخدم" : "User";

  return (
    <header className="sticky top-0 z-20 h-16 bg-[var(--header-bg)] border-b border-[var(--header-border)] shadow-[var(--shadow-sm)] transition-colors duration-200">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMobileMenuClick}
            className="lg:hidden p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)] transition-colors"
          >
            <MenuIcon />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)] transition-colors"
          >
            {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder={language === "ar" ? "بحث..." : "Search..."}
                className={`w-64 ${
                  language === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"
                } py-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--foreground)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all`}
                dir={language === "ar" ? "rtl" : "ltr"}
              />
              <span
                className={`absolute top-1/2 -translate-y-1/2 text-[var(--input-placeholder)] ${
                  language === "ar" ? "right-3" : "left-3"
                }`}
              >
                <SearchIcon />
              </span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          <ThemeToggle variant="dropdown" language={language} />

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] transition-colors"
            title={language === "en" ? "Switch to Arabic" : "التحويل إلى الإنجليزية"}
          >
            <GlobeIcon />
            <span className="hidden sm:inline">{language === "en" ? "عربي" : "EN"}</span>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)] transition-colors"
            >
              <BellIcon />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--error)] rounded-full"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[var(--card)] rounded-xl shadow-[var(--shadow-lg)] border border-[var(--card-border)] overflow-hidden animate-fadeInDown">
                <div className="p-4 border-b border-[var(--card-border)]">
                  <h3 className="font-semibold text-[var(--foreground)]">
                    {language === "ar" ? "الإشعارات" : "Notifications"}
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-4 text-center text-[var(--foreground-muted)]">
                    {language === "ar" ? "لا توجد إشعارات جديدة" : "No new notifications"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.first_name?.[0] || "A"}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {userName}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {user?.email || "admin@ameenhub.com"}
                </p>
              </div>
              <svg className="w-4 h-4 text-[var(--foreground-muted)] hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--card)] rounded-xl shadow-[var(--shadow-lg)] border border-[var(--card-border)] overflow-hidden animate-fadeInDown">
                <div className="p-4 border-b border-[var(--card-border)]">
                  <p className="font-medium text-[var(--foreground)]">{userName}</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {user?.email || "admin@ameenhub.com"}
                  </p>
                </div>
                <div className="py-2">
                  <a
                    href="/panel/profile"
                    className="flex items-center gap-3 px-4 py-2 text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <UserIcon />
                    <span>{language === "ar" ? "الملف الشخصي" : "Profile"}</span>
                  </a>
                  <button
                    onClick={() => {
                      // TODO: Implement logout
                      console.log("Logout clicked");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-[var(--error)] hover:bg-[var(--error-light)] transition-colors"
                  >
                    <LogoutIcon />
                    <span>{language === "ar" ? "تسجيل الخروج" : "Logout"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
