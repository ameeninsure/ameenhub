export const translations = {
  en: {
    // Header
    brand: "Ameen Hub",
    nav: {
      products: "Products",
      about: "About Us",
      contact: "Contact",
    },
    // Hero
    hero: {
      title: "Get Quick Insurance Offers",
      titleHighlight: "Ameen",
      description:
        "Your trusted online insurance platform. Compare and buy insurance policies easily and quickly.",
      cta: "Get a Quote",
      learnMore: "Learn More",
    },
    // Insurance Products
    products: {
      title: "Our Insurance Products",
      motor: {
        title: "Motor Insurance",
        description: "Comprehensive coverage for your vehicle",
      },
      travel: {
        title: "Travel Insurance",
        description: "Travel worry-free with full protection",
      },
      home: {
        title: "Home Insurance",
        description: "Protect your home and belongings",
      },
      medical: {
        title: "Medical Insurance",
        description: "Health coverage for you and your family",
      },
      creditLife: {
        title: "Credit Life",
        description: "Secure your financial commitments",
      },
      marine: {
        title: "Marine Insurance",
        description: "Coverage for cargo and shipping",
      },
      personalAccident: {
        title: "Personal Accident",
        description: "Protection against unexpected accidents",
      },
      quickQuote: {
        title: "Get Quick Quotes",
        description: "Compare prices instantly",
      },
    },
    // Footer
    footer: {
      copyright: "© 2026 Ameen Hub - All rights reserved",
    },
  },
  ar: {
    // Header
    brand: "أمين هب",
    nav: {
      products: "المنتجات",
      about: "من نحن",
      contact: "اتصل بنا",
    },
    // Hero
    hero: {
      title: "احصل على عروض التأمين السريعة",
      titleHighlight: "أمين",
      description:
        "منصتك الموثوقة للتأمين عبر الإنترنت. قارن واشترِ وثائق التأمين بسهولة وسرعة.",
      cta: "احصل على عرض سعر",
      learnMore: "معرفة المزيد",
    },
    // Insurance Products
    products: {
      title: "منتجات التأمين لدينا",
      motor: {
        title: "تأمين السيارات",
        description: "تغطية شاملة لسيارتك",
      },
      travel: {
        title: "تأمين السفر",
        description: "سافر بدون قلق مع حماية كاملة",
      },
      home: {
        title: "تأمين المنزل",
        description: "احمِ منزلك وممتلكاتك",
      },
      medical: {
        title: "التأمين الصحي",
        description: "تغطية صحية لك ولعائلتك",
      },
      creditLife: {
        title: "تأمين الائتمان",
        description: "أمّن التزاماتك المالية",
      },
      marine: {
        title: "التأمين البحري",
        description: "تغطية للبضائع والشحن",
      },
      personalAccident: {
        title: "الحوادث الشخصية",
        description: "حماية ضد الحوادث غير المتوقعة",
      },
      quickQuote: {
        title: "عروض أسعار سريعة",
        description: "قارن الأسعار فوراً",
      },
    },
    // Footer
    footer: {
      copyright: "© 2026 أمين هب - جميع الحقوق محفوظة",
    },
  },
} as const;

export type Language = keyof typeof translations;

// Define the shape of translations (without literal string types)
export interface Translations {
  brand: string;
  nav: {
    products: string;
    about: string;
    contact: string;
  };
  hero: {
    title: string;
    titleHighlight: string;
    description: string;
    cta: string;
    learnMore: string;
  };
  products: {
    title: string;
    motor: { title: string; description: string };
    travel: { title: string; description: string };
    home: { title: string; description: string };
    medical: { title: string; description: string };
    creditLife: { title: string; description: string };
    marine: { title: string; description: string };
    personalAccident: { title: string; description: string };
    quickQuote: { title: string; description: string };
  };
  footer: {
    copyright: string;
  };
}
