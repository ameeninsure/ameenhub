"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

interface AppearanceState {
  theme: ThemeMode;
  compactSidebar: boolean;
}

interface AppearanceContextValue {
  appearance: AppearanceState;
  setTheme: (theme: ThemeMode) => void;
  setCompactSidebar: (value: boolean) => void;
}

const STORAGE_KEY = "ameenhub_appearance";

const defaultAppearance: AppearanceState = {
  theme: "system",
  compactSidebar: false,
};

const AppearanceContext = createContext<AppearanceContextValue | undefined>(undefined);

function readStoredAppearance(): AppearanceState {
  if (typeof window === "undefined") return defaultAppearance;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAppearance;
    const parsed = JSON.parse(raw) as Partial<AppearanceState>;
    return {
      theme: parsed.theme ?? defaultAppearance.theme,
      compactSidebar: parsed.compactSidebar ?? defaultAppearance.compactSidebar,
    };
  } catch {
    return defaultAppearance;
  }
}

function applyTheme(theme: ThemeMode) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && prefersDark);
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", isDark);
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearance] = useState<AppearanceState>(defaultAppearance);

  useEffect(() => {
    setAppearance(readStoredAppearance());
  }, []);

  useEffect(() => {
    applyTheme(appearance.theme);
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
    } catch {
      // ignore storage errors
    }

    if (appearance.theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    if (media.addEventListener) {
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
    media.addListener(handler);
    return () => media.removeListener(handler);
  }, [appearance]);

  const value = useMemo<AppearanceContextValue>(
    () => ({
      appearance,
      setTheme: (theme) => setAppearance((prev) => ({ ...prev, theme })),
      setCompactSidebar: (compactSidebar) =>
        setAppearance((prev) => ({ ...prev, compactSidebar })),
    }),
    [appearance]
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error("useAppearance must be used within AppearanceProvider");
  }
  return context;
}
