export const Colors = {
  light: {
    primary: '#0a7ea4',
    background: '#ffffff',
    text: '#11181C',
    secondary: '#4D4D4D',
    accent: '#1A1A1A',
    border: '#e1e1e1',
    card: '#f8f9fa',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8',
  },
  dark: {
    primary: '#0a7ea4',
    background: '#151718',
    text: '#ECEDEE',
    secondary: '#9BA1A6',
    accent: '#ffffff',
    border: '#2f3336',
    card: '#1e2124',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8',
  },
  custom: {
    primary: '#FFFFFF',
    secondary: '#4D4D4D',
    accent: '#1A1A1A',
  },
};

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof Colors.light;