import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { LanguageContextType } from '../types';
import { translations } from '../localization/translations';

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'fr' | 'ar'>('en');

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  useEffect(() => {
    i18n.locale = language;
  }, [language]);

  const loadStoredLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem('language');
      if (storedLanguage && ['en', 'fr', 'ar'].includes(storedLanguage)) {
        setLanguageState(storedLanguage as 'en' | 'fr' | 'ar');
      } else {
        // Use device locale if available
        const locale = Localization.locale || Localization.getLocales()?.[0]?.languageCode || 'en';
        const deviceLocale = locale.split('-')[0];
        if (['en', 'fr', 'ar'].includes(deviceLocale)) {
          setLanguageState(deviceLocale as 'en' | 'fr' | 'ar');
        }
      }
    } catch (error) {
      console.error('Error loading stored language:', error);
    }
  };

  const setLanguage = async (lang: 'en' | 'fr' | 'ar') => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem('language', lang);
    } catch (error) {
      console.error('Error storing language:', error);
    }
  };

  const t = (key: string): string => {
    return i18n.t(key);
  };

  const isRTL = language === 'ar';

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};