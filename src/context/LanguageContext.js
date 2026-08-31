/**
 * LanguageContext — 3 languages only: English · اردو · Roman Urdu.
 * Usage: const { language, setLanguage, t, isRTL } = useLanguageContext();
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export const TRANSLATIONS = {
  en: {
    appName: 'Safe Pakistan',
    tagline: 'Apne Ghar Ki Hifazat',
    checkMessage: 'Check a message',
    analyzing: 'Analyzing',
    safe: 'Safe',
    suspicious: 'Suspicious',
    scam: 'Scam',
    familyShield: 'Family Shield',
    threatLibrary: 'Threat Library',
  },
  ur: {
    appName: 'سیف پاکستان',
    tagline: 'اپنے گھر کی حفاظت',
    checkMessage: 'پیغام کی جانچ کریں',
    analyzing: 'جانچ جاری ہے',
    safe: 'محفوظ',
    suspicious: 'مشکوک',
    scam: 'دھوکہ',
    familyShield: 'فیملی شیلڈ',
    threatLibrary: 'تھرٹ لائبریری',
  },
  ru: {
    appName: 'Safe Pakistan',
    tagline: 'Apne Ghar Ki Hifazat',
    checkMessage: 'Message jaanchein',
    analyzing: 'Jaanch chal rahi hai',
    safe: 'Mehfooz',
    suspicious: 'Shaki',
    scam: 'Dhoka',
    familyShield: 'Family Shield',
    threatLibrary: 'Threat Library',
  },
};

const TTS_LOCALES = { en: 'en-PK', ur: 'ur-PK', ru: 'en-PK' };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ur'); // 'en' | 'ur' | 'ru'

  const setLang = useCallback(code => {
    if (TRANSLATIONS[code]) setLanguage(code);
  }, []);

  const t = useCallback(
    key => (TRANSLATIONS[language] && TRANSLATIONS[language][key]) || TRANSLATIONS.en[key] || key,
    [language]
  );

  const value = useMemo(() => ({
    language,
    setLanguage: setLang,
    setLang,
    t,
    isRTL: language === 'ur',
    ttsLocale: TTS_LOCALES[language] || 'en-PK',
  }), [language, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguageContext() {
  return useContext(LanguageContext) || {};
}
