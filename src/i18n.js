import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "process": "Process",
        "faq": "FAQ",
        "sessions": "Sessions",
        "book_now": "Book Now",
        "dashboard": "Dashboard"
      },
      "hero": {
        "badge": "REAL DOCTORS. REAL ANSWERS. FROM HOME.",
        "title": "Your smile deserves <em>total protection</em>, starting from your couch.",
        "subtitle": "Consult with <strong>Dr. Muhammad Elberbawi</strong> — a licensed expert with over 10 years of experience. Get live clarity on your dental health in just 20 minutes.",
        "book_btn": "Book Your Session",
        "price_note": "10% OFF FIRST SESSION",
        "features": {
          "no_waiting": "NO WAITING ROOMS",
          "no_prescriptions": "NO PRESCRIPTIONS",
          "personalized": "100% PERSONALIZED"
        }
      },
      "common": {
        "loading": "Loading...",
        "error": "An error occurred",
        "save": "Save",
        "cancel": "Cancel",
        "delete": "Delete"
      }
    }
  },
  ar: {
    translation: {
      "nav": {
        "process": "خطواتنا",
        "faq": "أسئلة شائعة",
        "sessions": "جلساتنا",
        "book_now": "احجز الآن",
        "dashboard": "لوحة التحكم"
      },
      "hero": {
        "badge": "أطباء حقيقيون. إجابات حقيقية. من منزلك.",
        "title": "ابتسامتك تستحق <em>حماية كاملة</em>، تبدأ من أريكتك.",
        "subtitle": "استشر <strong>د. محمد البرباوي</strong> — خبير مرخص بخبرة تزيد عن 10 سنوات. احصل على وضوح مباشر لصحة أسنانك في 20 دقيقة فقط.",
        "book_btn": "احجز جلستك",
        "price_note": "خصم 10% على أول جلسة",
        "features": {
          "no_waiting": "لا غرف انتظار",
          "no_prescriptions": "لا وصفات طبية",
          "personalized": "100% مخصصة لك"
        }
      },
      "common": {
        "loading": "جاري التحميل...",
        "error": "حدث خطأ ما",
        "save": "حفظ",
        "cancel": "إلغاء",
        "delete": "حذف"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
