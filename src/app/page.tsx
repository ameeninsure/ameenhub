"use client";

import { useLanguage } from "@/lib/i18n";
import { Header } from "@/components/Header";

export default function Home() {
  const { t, dir } = useLanguage();

  const insuranceProducts = [
    {
      key: "motor",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4zM5 11l1-5h12l1 5M5 11h14M5 11l-1 3h16l-1-3" />
        </svg>
      ),
      iconBg: "bg-blue-500",
    },
    {
      key: "travel",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: "bg-cyan-500",
    },
    {
      key: "home",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      iconBg: "bg-emerald-500",
    },
    {
      key: "medical",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      iconBg: "bg-red-500",
    },
    {
      key: "creditLife",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      iconBg: "bg-orange-500",
    },
    {
      key: "marine",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m-8-9H3m18 0h-1M5.636 5.636l-.707.707m13.435 13.435l-.707-.707M5.636 18.364l-.707-.707m13.435-13.435l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ),
      iconBg: "bg-sky-500",
    },
    {
      key: "personalAccident",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      iconBg: "bg-pink-500",
    },
    {
      key: "quickQuote",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      iconBg: "bg-amber-600",
      special: true,
    },
  ];

  return (
    <div
      dir={dir}
      className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-900"
    >
      {/* Header */}
      <Header />

      {/* Hero - with padding for fixed header */}
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {t.hero.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10">
            {t.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/quote"
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              {t.hero.cta}
            </a>
            <a
              href="#products"
              className="px-8 py-3 border border-slate-400 dark:border-slate-500 text-slate-700 dark:text-white rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {t.hero.learnMore}
            </a>
          </div>
        </div>

        {/* Insurance Products Grid */}
        <section id="products">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">
            {t.products.title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {insuranceProducts.map((product) => {
              const productData = t.products[product.key as keyof typeof t.products];
              if (typeof productData === "string") return null;
              
              return (
                <a
                  key={product.key}
                  href={product.special ? "/quote" : `/${product.key}`}
                  className={`group p-6 rounded-2xl transition-all hover:scale-105 shadow-sm hover:shadow-lg ${
                    product.special
                      ? "bg-gradient-to-br from-amber-500 to-amber-700 text-white"
                      : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                        product.special ? "bg-white/20" : product.iconBg
                      }`}
                    >
                      <span className="text-white">
                        {product.icon}
                      </span>
                    </div>
                    <h3 className={`font-semibold mb-1 ${product.special ? "text-white" : "text-slate-900 dark:text-white"}`}>
                      {productData.title}
                    </h3>
                    <p className={`text-sm ${product.special ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
                      {productData.description}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-300 dark:border-slate-700 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {t.footer.copyright}
        </div>
      </footer>
    </div>
  );
}
