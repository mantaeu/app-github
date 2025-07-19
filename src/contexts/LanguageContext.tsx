import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, TranslationKey, Language } from '../localization/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  const loadStoredLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem('app_language');
      console.log('📱 Loaded stored language:', storedLanguage);
      
      if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'fr' || storedLanguage === 'ar')) {
        setLanguageState(storedLanguage as Language);
      } else {
        // Default to English if no stored language
        setLanguageState('en');
      }
    } catch (error) {
      console.error('Error loading stored language:', error);
      setLanguageState('en');
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      console.log('🌐 Setting language to:', lang);
      setLanguageState(lang);
      await AsyncStorage.setItem('app_language', lang);
      console.log('💾 Language saved to storage:', lang);
    } catch (error) {
      console.error('Error storing language:', error);
    }
  };

  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    try {
      let translation = translations[language]?.[key];
      
      if (!translation) {
        // Fallback to English if translation not found
        translation = translations.en[key];
        if (translation) {
          console.warn(`Translation missing for key "${key}" in language "${language}", using English fallback`);
        } else {
          // Return the key itself if no translation found
          console.warn(`Translation missing for key "${key}" in all languages`);
          return key;
        }
      }
      
      // Replace placeholders with parameters
      if (params && translation) {
        let result = translation;
        Object.keys(params).forEach(param => {
          result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
        });
        return result;
      }
      
      return translation || key;
    } catch (error) {
      console.error('Error getting translation for key:', key, error);
      return key;
    }
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