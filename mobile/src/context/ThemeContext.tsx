import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

type ThemeMode = 'system' | 'light' | 'dark';

export interface Colors {
  background: string;
  card: string;
  text: string;
  textMuted: string;
  primary: string;
  border: string;
}

const lightColors: Colors = {
  background: '#F9FAFB', // gray-50
  card: '#FFFFFF', // white
  text: '#1F2937', // gray-800
  textMuted: '#6B7280', // gray-500
  primary: '#2563EB', // blue-600
  border: '#E5E7EB', // gray-200
};

const darkColors: Colors = {
  background: '#111827', // gray-900
  card: '#1F2937', // gray-800
  text: '#F3F4F6', // gray-100
  textMuted: '#9CA3AF', // gray-400
  primary: '#3B82F6', // blue-500
  border: '#374151', // gray-700
};

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
  colors: Colors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const systemColorScheme = useNativeColorScheme(); // 'light' | 'dark' | null | undefined
  const { setColorScheme } = useNativeWindColorScheme();

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@theme_mode');
        if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
          setThemeModeState(storedTheme as ThemeMode);
        }
      } catch (e) {
        console.error('Failed to load theme mode', e);
      }
    };
    loadTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem('@theme_mode', mode);
    } catch (e) {
      console.error('Failed to save theme mode', e);
    }
  };

  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  useEffect(() => {
    // Sync with nativewind
    setColorScheme(themeMode);
  }, [themeMode, setColorScheme]);

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
