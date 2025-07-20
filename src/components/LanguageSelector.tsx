import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  style?: any;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  style
}) => {
  const { colors } = useTheme();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    languageButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedButton: {
      backgroundColor: colors.primary,
    },
    unselectedButton: {
      backgroundColor: 'transparent',
    },
    languageText: {
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
    },
    selectedText: {
      color: colors.onPrimary || '#ffffff',
    },
    unselectedText: {
      color: colors.text,
    },
    flagText: {
      fontSize: 16,
      marginBottom: 2,
    },
    nameText: {
      fontSize: 10,
    }
  });

  return (
    <View style={[styles.container, style]}>
      {languages.map((language) => (
        <TouchableOpacity
          key={language.code}
          style={[
            styles.languageButton,
            selectedLanguage === language.code ? styles.selectedButton : styles.unselectedButton
          ]}
          onPress={() => onLanguageChange(language.code)}
        >
          <Text style={styles.flagText}>{language.flag}</Text>
          <Text style={[
            styles.languageText,
            styles.nameText,
            selectedLanguage === language.code ? styles.selectedText : styles.unselectedText
          ]}>
            {language.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default LanguageSelector;