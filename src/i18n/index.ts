import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import ruCommon from "./locales/ru/common.json";
import deCommon from "./locales/de/common.json";

import enAuth from "./locales/en/auth.json";
import ruAuth from "./locales/ru/auth.json";
import deAuth from "./locales/de/auth.json";

export const supportedLanguages = ["en", "de", "ru"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const STORAGE_KEY = "emotix_lang";

function getInitialLanguage(): SupportedLanguage {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "de" || saved === "ru") return saved;

    const nav = (navigator.language || "en").toLowerCase();
    if (nav.startsWith("de")) return "de";
    if (nav.startsWith("ru")) return "ru";
    return "en";
}

i18n.use(initReactI18next).init({
    lng: getInitialLanguage(),
    fallbackLng: "en",
    supportedLngs: [...supportedLanguages],
    ns: ["common", "auth"],
    defaultNS: "common",
    resources: {
        en: { common: enCommon, auth: enAuth },
        de: { common: deCommon, auth: deAuth },
        ru: { common: ruCommon, auth: ruAuth },
    },
    interpolation: { escapeValue: false },
});

export function setLanguage(lang: SupportedLanguage) {
    localStorage.setItem(STORAGE_KEY, lang);
    return i18n.changeLanguage(lang);
}

export default i18n;
