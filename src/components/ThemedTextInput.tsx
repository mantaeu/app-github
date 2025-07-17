import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ThemedTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const ThemedTextInput: React.FC<ThemedTextInputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const { isRTL } = useLanguage();
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle = {
    borderWidth: 1,
    borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    textAlign: isRTL ? 'right' as const : 'left' as const,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[inputStyle, style]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor={colors.secondary}
        {...props}
      />
      {error && (
        <Text style={[styles.error, { color: colors.error, textAlign: isRTL ? 'right' : 'left' }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});