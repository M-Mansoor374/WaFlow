import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

const RTL_LANGUAGES = ["ur", "ar"];

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "ur", "ar"],
    ns: ["common", "dashboard", "chat"],
    defaultNS: "common",
    backend: { loadPath: "/locales/{{lng}}/{{ns}}.json" },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  });

i18n.on("languageChanged", (lng: string) => {
  const dir = RTL_LANGUAGES.includes(lng) ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

export default i18n;
