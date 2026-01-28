"use client";

import { useLanguage, Language } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "ar", label: "عربي" },
  ];

  return (
    <div className="flex items-center gap-1 bg-[var(--background-secondary)] rounded-lg p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            language === lang.code
              ? "bg-[var(--card)] text-[var(--primary)] shadow-sm"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
