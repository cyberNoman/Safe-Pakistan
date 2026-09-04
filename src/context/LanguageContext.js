/**
 * LanguageContext — 3 languages only: English · اردو · Roman Urdu.
 * Usage: const { language, setLanguage, t, isRTL } = useLanguageContext();
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardian language (chat + TTS) persisted across restarts — same AsyncStorage
// idiom LocalDBService uses. Own key so this file owns its own persistence.
const KEY_LANG = '@hifazat/lang';

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
  const userChose = useRef(false);

  // Restore the saved guardian language on mount.
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(KEY_LANG)
      .then(saved => {
        if (mounted && !userChose.current && saved && TRANSLATIONS[saved]) setLanguage(saved);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const setLang = useCallback(code => {
    if (TRANSLATIONS[code]) {
      userChose.current = true;
      setLanguage(code);
      AsyncStorage.setItem(KEY_LANG, code).catch(() => {});
    }
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
