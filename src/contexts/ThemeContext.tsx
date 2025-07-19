import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { ThemeContextType } from '../types';
import { Colors, ColorScheme } from '../constants/Colors';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadStoredTheme();
  }, []); // Empty dependency array to run only once

  const loadStoredTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme && ['light', 'dark'].includes(storedTheme)) {
        setTheme(storedTheme as 'light' | 'dark');
      } else {
        // Use system theme if available, fallback to light
        const defaultTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
        setTheme(defaultTheme);
      }
    } catch (error) {
      console.error('Error loading stored theme:', error);
      setTheme('light'); // Fallback to light theme
    } finally {
      setIsInitialized(true);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error storing theme:', error);
    }
  };

  const colors = Colors[theme];

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    colors,
  };

  // Don't render children until theme is initialized to prevent flashing
  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};