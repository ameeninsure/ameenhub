"use client";

/**
 * Professional Theme Toggle Component
 * Supports Light, Dark, and System theme modes with smooth transitions
 */

import React, { useState, useRef, useEffect } from "react";
import { useAppearance } from "@/lib/settings";

// Icons
const SunIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const SystemIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

interface ThemeToggleProps {
  variant?: "button" | "dropdown" | "switch";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  language?: "en" | "ar";
}

const labels = {
  en: {
    light: "Light",
    dark: "Dark",
    system: "System",
    theme: "Theme",
  },
  ar: {
    light: "فاتح",
    dark: "داكن",
    system: "النظام",
    theme: "السمة",
  },
};

export function ThemeToggle({
  variant = "button",
  size = "md",
  showLabel = false,
  language = "en",
}: ThemeToggleProps) {
  const { appearance, setTheme } = useAppearance();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = labels[language];

  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Current theme icon
  const CurrentIcon =
    appearance.theme === "dark"
      ? MoonIcon
      : appearance.theme === "light"
      ? SunIcon
      : SystemIcon;

  // Cycle through themes for button variant
  const cycleTheme = () => {
    const themes = ["light", "dark", "system"] as const;
    const currentIndex = themes.indexOf(appearance.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  if (variant === "switch") {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme("light")}
          className={`p-2 rounded-lg transition-all duration-200 ${
            appearance.theme === "light"
              ? "bg-[var(--primary-light)] text-[var(--primary)]"
              : "text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)]"
          }`}
        >
          <SunIcon className={iconSizes[size]} />
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={`p-2 rounded-lg transition-all duration-200 ${
            appearance.theme === "dark"
              ? "bg-[var(--primary-light)] text-[var(--primary)]"
              : "text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)]"
          }`}
        >
          <MoonIcon className={iconSizes[size]} />
        </button>
        <button
          onClick={() => setTheme("system")}
          className={`p-2 rounded-lg transition-all duration-200 ${
            appearance.theme === "system"
              ? "bg-[var(--primary-light)] text-[var(--primary)]"
              : "text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)]"
          }`}
        >
          <SystemIcon className={iconSizes[size]} />
        </button>
      </div>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 ${sizeClasses[size]} rounded-lg text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] transition-all duration-200`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <CurrentIcon className={iconSizes[size]} />
          {showLabel && (
            <span className="text-sm font-medium">
              {appearance.theme === "light"
                ? t.light
                : appearance.theme === "dark"
                ? t.dark
                : t.system}
            </span>
          )}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 right-0 z-50 min-w-[160px] bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-[var(--shadow-lg)] overflow-hidden animate-fadeInDown">
            <div className="p-1">
              {(["light", "dark", "system"] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => {
                    setTheme(theme);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    appearance.theme === theme
                      ? "bg-[var(--primary-light)] text-[var(--primary)]"
                      : "text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                  }`}
                >
                  {theme === "light" ? (
                    <SunIcon className="w-5 h-5" />
                  ) : theme === "dark" ? (
                    <MoonIcon className="w-5 h-5" />
                  ) : (
                    <SystemIcon className="w-5 h-5" />
                  )}
                  <span className="flex-1 text-start text-sm font-medium">
                    {theme === "light" ? t.light : theme === "dark" ? t.dark : t.system}
                  </span>
                  {appearance.theme === theme && <CheckIcon className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: button variant
  return (
    <button
      onClick={cycleTheme}
      className={`flex items-center gap-2 ${sizeClasses[size]} rounded-lg text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] transition-all duration-200`}
      title={`${t.theme}: ${appearance.theme === "light" ? t.light : appearance.theme === "dark" ? t.dark : t.system}`}
    >
      <CurrentIcon className={iconSizes[size]} />
      {showLabel && (
        <span className="text-sm font-medium">
          {appearance.theme === "light"
            ? t.light
            : appearance.theme === "dark"
            ? t.dark
            : t.system}
        </span>
      )}
    </button>
  );
}

/**
 * Theme Selector Cards - for settings pages
 */
interface ThemeSelectorCardsProps {
  language?: "en" | "ar";
}

export function ThemeSelectorCards({ language = "en" }: ThemeSelectorCardsProps) {
  const { appearance, setTheme } = useAppearance();
  const t = labels[language];

  const themes = [
    {
      value: "light" as const,
      label: t.light,
      icon: SunIcon,
      preview: {
        bg: "#f8fafc",
        card: "#ffffff",
        text: "#0f172a",
        sidebar: "#ffffff",
      },
    },
    {
      value: "dark" as const,
      label: t.dark,
      icon: MoonIcon,
      preview: {
        bg: "#0f172a",
        card: "#1e293b",
        text: "#f1f5f9",
        sidebar: "#1e293b",
      },
    },
    {
      value: "system" as const,
      label: t.system,
      icon: SystemIcon,
      preview: null, // Will show both light and dark
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {themes.map((theme) => (
        <button
          key={theme.value}
          onClick={() => setTheme(theme.value)}
          className={`group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
            appearance.theme === theme.value
              ? "border-[var(--primary)] bg-[var(--primary-light)]"
              : "border-[var(--card-border)] hover:border-[var(--foreground-muted)] bg-[var(--card)]"
          }`}
        >
          {/* Preview */}
          <div className="w-full aspect-video rounded-lg overflow-hidden mb-3 shadow-[var(--shadow)]">
            {theme.preview ? (
              // Single theme preview
              <div
                className="w-full h-full p-1.5"
                style={{ backgroundColor: theme.preview.bg }}
              >
                <div className="flex h-full gap-1">
                  {/* Mini sidebar */}
                  <div
                    className="w-1/4 rounded-sm"
                    style={{ backgroundColor: theme.preview.sidebar }}
                  />
                  {/* Content area */}
                  <div className="flex-1 flex flex-col gap-1">
                    {/* Mini header */}
                    <div
                      className="h-2 rounded-sm"
                      style={{ backgroundColor: theme.preview.card }}
                    />
                    {/* Mini cards */}
                    <div className="flex-1 grid grid-cols-2 gap-1">
                      <div
                        className="rounded-sm"
                        style={{ backgroundColor: theme.preview.card }}
                      />
                      <div
                        className="rounded-sm"
                        style={{ backgroundColor: theme.preview.card }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // System theme preview (split view)
              <div className="w-full h-full flex">
                <div className="w-1/2 p-1" style={{ backgroundColor: "#f8fafc" }}>
                  <div className="h-full flex gap-0.5">
                    <div className="w-1/3 rounded-sm bg-white" />
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="h-2 rounded-sm bg-white" />
                      <div className="flex-1 rounded-sm bg-white" />
                    </div>
                  </div>
                </div>
                <div className="w-1/2 p-1" style={{ backgroundColor: "#0f172a" }}>
                  <div className="h-full flex gap-0.5">
                    <div className="w-1/3 rounded-sm bg-slate-800" />
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="h-2 rounded-sm bg-slate-800" />
                      <div className="flex-1 rounded-sm bg-slate-800" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Label */}
          <div className="flex items-center gap-2">
            <theme.icon
              className={`w-5 h-5 ${
                appearance.theme === theme.value
                  ? "text-[var(--primary)]"
                  : "text-[var(--foreground-muted)]"
              }`}
            />
            <span
              className={`font-medium ${
                appearance.theme === theme.value
                  ? "text-[var(--primary)]"
                  : "text-[var(--foreground)]"
              }`}
            >
              {theme.label}
            </span>
          </div>

          {/* Check indicator */}
          {appearance.theme === theme.value && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
              <CheckIcon className="w-3 h-3 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export default ThemeToggle;
