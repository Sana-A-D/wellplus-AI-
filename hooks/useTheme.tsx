import React, { useState, useEffect, createContext, useContext } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

const palette = {
  primary: '#22C55E',
  secondary: '#3B82F6',
  accent: '#8B5CF6',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#10B981',
};

const lightColors = {
  ...palette,
  background: '#FAFBFD',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#94A3B8',
  border: '#E2E8F0',
  card: '#FFFFFF',
};

const darkColors = {
  ...palette,
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
  card: '#1E293B',
};

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  warning: string;
  danger: string;
  success: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  card: string;
}

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: ThemeColors;
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
  radius: { sm: number; md: number; lg: number; xl: number };
  setTheme: (theme: Theme) => void;
}

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
const radius = { sm: 8, md: 12, lg: 16, xl: 24 };

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Provide a safe default when used outside provider (shouldn't happen, but avoids crash)
    return {
      theme: 'light' as Theme,
      isDark: false,
      colors: lightColors,
      spacing,
      radius,
      setTheme: () => {},
    };
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() || 'light'
  );

  useEffect(() => {
    loadTheme();
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || 'light');
    });
    return () => sub.remove();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('@wellplus_theme');
      if (saved) setThemeState(saved as Theme);
    } catch (e) {
      console.error('Error loading theme:', e);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem('@wellplus_theme', newTheme);
    } catch (e) {
      console.error('Error saving theme:', e);
    }
  };

  const isDark = false; // Locked to light theme
  const colors = lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, spacing, radius, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};