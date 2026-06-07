import { Appearance } from 'react-native';
import * as Font from 'expo-font';

// Primary color palette (Tailwind inspired)
export const palette = {
  primary: '#3B82F6', // blue-500
  secondary: '#10B981', // green-600
  accent: '#F59E0B', // amber-500
  danger: '#EF4444', // red-500
  surfaceLight: '#F9FAFB', // gray-50
  surfaceDark: '#1F2937', // gray-800
  backgroundLight: '#FFFFFF',
  backgroundDark: '#111827',
  textLight: '#1F2937',
  textDark: '#F9FAFB',
  borderLight: '#E5E7EB',
  borderDark: '#374151',
};

// Spacing scale (4px base)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Border radius values
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
};

// Font handling - Temporarily removed missing local fonts
export const loadFonts = async () => {
  // Add expo-google-fonts or local fonts here later
};

// Helper to get colors based on dark mode
export const getColors = (isDark: boolean) => ({
  primary: palette.primary,
  secondary: palette.secondary,
  accent: palette.accent,
  danger: palette.danger,
  surface: isDark ? palette.surfaceDark : palette.surfaceLight,
  background: isDark ? palette.backgroundDark : palette.backgroundLight,
  text: isDark ? palette.textDark : palette.textLight,
  border: isDark ? palette.borderDark : palette.borderLight,
});
