import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ThemedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  children,
  style,
  padding = 16,
}) => {
  const { colors } = useTheme();

  const cardStyle = {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding,
    // boxShadow replaces deprecated shadow* props for web compatibility
    boxShadow: '0px 2px 3.84px rgba(0,0,0,0.1)',
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  };

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};