import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { translations } from '../i18n/translations.js';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', region: 'Global', localeTag: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'National', localeTag: 'hi-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', region: 'Maharashtra', localeTag: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', region: 'Gujarat', localeTag: 'gu-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', region: 'Tamil Nadu', localeTag: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', region: 'Telangana & AP', localeTag: 'te-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', region: 'West Bengal', localeTag: 'bn-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', region: 'Karnataka', localeTag: 'kn-IN' }
];

export const SUPPORTED_CODES = SUPPORTED_LANGUAGES.map(l => l.code);

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('localserve_lang');
      return saved && SUPPORTED_CODES.includes(saved) ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  const setLanguage = useCallback((newLang) => {
    if (SUPPORTED_CODES.includes(newLang)) {
      try {
        localStorage.setItem('localserve_lang', newLang);
      } catch (e) {
        console.warn('Could not save language to localStorage:', e);
      }
      setLanguageState(newLang);

      // Brief gentle feedback banner/toast
      const langObj = SUPPORTED_LANGUAGES.find(l => l.code === newLang);
      if (langObj) {
        const feedback = `${langObj.nativeName} (${langObj.name})`;
        setToastMessage(`Language switched to ${feedback}`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    }
  }, []);

  // Sync HTML lang attribute whenever language changes
  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch (e) {}
  }, [language]);

  // Listen to storage events to sync across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'localserve_lang' && e.newValue) {
        if (SUPPORTED_CODES.includes(e.newValue)) {
          setLanguageState(e.newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const currentLanguageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  // Main translation function
  const t = useCallback((key, fallback = '') => {
    if (!key) return '';
    const currentDict = translations[language] || translations.en;
    if (currentDict && currentDict[key] !== undefined) {
      return currentDict[key];
    }
    // Fallback to English
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    // Fallback string provided or key itself
    if (fallback) return fallback;
    return key;
  }, [language]);

  const tCategory = useCallback((categoryNameOrSlug) => {
    if (!categoryNameOrSlug) return '';
    const normalized = categoryNameOrSlug.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const key = `cat_${normalized}`;
    return t(key, categoryNameOrSlug);
  }, [t]);

  const tStatus = useCallback((status) => {
    if (!status) return '';
    const key = `status_${status.toLowerCase()}`;
    return t(key, status);
  }, [t]);

  const tPaymentMethod = useCallback((method) => {
    if (!method) return '';
    if (method.toLowerCase() === 'cash') return t('payment_method_cash', 'Cash on Service');
    if (method.toLowerCase() === 'online') return t('payment_method_online', 'Online (UPI / Card)');
    return method;
  }, [t]);

  const tRole = useCallback((role) => {
    if (!role) return '';
    if (role === 'customer') return t('role_customer', 'Customer');
    if (role === 'provider') return t('role_provider', 'Provider');
    if (role === 'admin') return t('role_admin', 'Administrator');
    return role;
  }, [t]);

  // Number / Currency / Date formatting helpers
  const formatCurrency = useCallback((amount) => {
    if (typeof amount !== 'number') {
      const num = Number(amount);
      if (isNaN(num)) return `₹ ${amount || 0}`;
      amount = num;
    }
    try {
      const locale = currentLanguageInfo?.localeTag || 'en-IN';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
      return `₹ ${amount.toLocaleString('en-IN')}`;
    }
  }, [currentLanguageInfo]);

  const formatDate = useCallback((dateInput, options = {}) => {
    if (!dateInput) return '';
    try {
      const date = new Date(dateInput);
      const locale = currentLanguageInfo?.localeTag || 'en-IN';
      const defaultOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...options
      };
      return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
    } catch {
      return String(dateInput);
    }
  }, [currentLanguageInfo]);

  const formatNumber = useCallback((number) => {
    if (number === undefined || number === null) return '';
    try {
      const locale = currentLanguageInfo?.localeTag || 'en-IN';
      return new Intl.NumberFormat(locale).format(number);
    } catch {
      return String(number);
    }
  }, [currentLanguageInfo]);

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
      currentLanguageInfo,
      t,
      tCategory,
      tStatus,
      tPaymentMethod,
      tRole,
      formatCurrency,
      formatDate,
      formatNumber
    }}>
      {children}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#26352A',
          color: '#F4F1DE',
          padding: '10px 18px',
          borderRadius: 12,
          fontSize: '0.88rem',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <span>🌐</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
