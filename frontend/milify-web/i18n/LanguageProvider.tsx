"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import fa from "./messages/fa.json";
import en from "./messages/en.json";

type Locale = "fa" | "en";
const messages = { fa, en };
const storageKey = "milify-locale";
const localeEvent = "milify-language-change";

const LanguageContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
} | null>(null);

function subscribe(callback: () => void) {
  window.addEventListener(localeEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(localeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

function readLocale(): Locale {
  return localStorage.getItem(storageKey) === "en" ? "en" : "fa";
}

function setLocale(locale: Locale) {
  localStorage.setItem(storageKey, locale);
  window.dispatchEvent(new Event(localeEvent));
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readLocale, () => "fa" as const);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
    document.body.style.fontFamily = locale === "fa" ? "var(--font-vazirmatn)" : "var(--font-inter)";
  }, [locale]);

  function t(key: string) {
    let value: unknown = messages[locale];
    for (const part of key.split(".")) {
      if (!value || typeof value !== "object") return key;
      value = (value as Record<string, unknown>)[part];
    }
    return typeof value === "string" ? value : key;
  }

  return (
    <LanguageContext.Provider value={{
      locale,
      setLocale,
      toggleLocale: () => setLocale(locale === "fa" ? "en" : "fa"),
      t,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
