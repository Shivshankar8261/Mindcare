import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { Resource } from "i18next";

import { resources } from "@/locales/resources_i18n";

// Singleton i18next instance.
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: resources as unknown as Resource,
    lng: "en",
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;

