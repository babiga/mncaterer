"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "mn";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: any, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("dashboard-language") as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "mn")) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("dashboard-language", lang);
  };

  // Simple translate function helper
  const t = (translations: any, defaultValue?: string) => {
    if (!translations) return defaultValue || "";
    return translations[language] || translations["en"] || defaultValue || "";
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
