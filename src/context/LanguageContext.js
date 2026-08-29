/**
 * LanguageContext — exactly three languages: English · اردو · Roman Urdu.
 * Contract (AGENTS.md): language, setLang, t(), isRTL, ttsLocale.
 * Never add Punjabi / Sindhi / Pashto / Balochi.
 */
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

export const LANGS = [
  { code: 'en',    label: 'English' },
  { code: 'ur',    label: 'اردو' },
  { code: 'roman', label: 'Roman Urdu' },
];

// Minimal shared dictionary; screens may keep their own copy strings.
const STRINGS = {
  en: {
    appName: 'Safe Pakistan',
    tagline: 'Apne Ghar Ki Hifazat',
    scan: 'Scan',
    safe: 'Safe',
    scam: 'Scam',
    suspicious: 'Suspicious',
    report: 'NCCIA Shikayat',
  },
  ur: {
    appName: 'سیف پاکستان',
    tagline: 'اپنے گھر کی حفاظت',
    scan: 'جانچ',
    safe: 'محفوظ',
    scam: 'دھوکہ',
    suspicious: 'مشکوک',
    report: 'این سی سی اے شکایت',
  },
  roman: {
    appName: 'Safe Pakistan',
    tagline: 'Apne Ghar Ki Hifazat',
    scan: 'Jaanch',
    safe: 'Mehfooz',
    scam: 'Dhoka',
    suspicious: 'Mashkook',
    report: 'NCCIA Shikayat',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLang] = useState('en');

  const isRTL = language === 'ur';
  const ttsLocale = language === 'ur' ? 'ur-PK' : 'en-US';

  const t = useCallback(
    key => (STRINGS[language] && STRINGS[language][key]) || STRINGS.en[key] || key,
    [language]
  );

  const value = useMemo(() => ({
    language,
    setLang,
    t,
    isRTL,
    ttsLocale,
  }), [language, t, isRTL, ttsLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguageContext() {
  return useContext(LanguageContext);
}
