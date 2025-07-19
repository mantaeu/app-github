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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadStoredLanguage();
  }, []); // Empty dependency array to run only once

  const loadStoredLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem('app_language');
      
      if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'fr' || storedLanguage === 'ar')) {
        setLanguageState(storedLanguage as Language);
      } else {
        // Default to English if no stored language
        setLanguageState('en');
      }
    } catch (error) {
      // Fallback to English on error
      setLanguageState('en');
    } finally {
      setIsInitialized(true);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem('app_language', lang);
    } catch (error) {
      // Silent error handling to prevent infinite loops
    }
  };

  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    try {
      let translation = translations[language]?.[key];
      
      if (!translation) {
        // Fallback to English if translation not found
        translation = translations.en[key];
        if (!translation) {
          // Return the key itself if no translation found
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
      // Return key on error to prevent crashes
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

  // Don't render children until language is initialized
  if (!isInitialized) {
    return null;
  }

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