import { type ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { TamaguiProvider, Theme, isWeb } from 'tamagui';
import tamaguiConfig from './tamagui.config';

export type ThemeName = 'light' | 'dark' | 'ocean' | 'forest' | 'midnight' | 'sunrise';

type ThemeSource = 'system' | 'manual';

interface ThemeContextValue {
  /** Current active theme */
  theme: ThemeName;
  /** Toggle between light and dark (switches to manual mode) */
  toggleTheme: () => void;
  /** Set a specific theme (switches to manual mode) */
  setTheme: (theme: ThemeName) => void;
  /** Whether theme is following system preference */
  isSystemTheme: boolean;
  /** Use system theme preference */
  useSystemTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  isSystemTheme: true,
  useSystemTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface TamaguiRootProviderProps {
  children: ReactNode;
}

export function TamaguiRootProvider({ children }: TamaguiRootProviderProps) {
  const colorScheme = useColorScheme();
  const [themeSource, setThemeSource] = useState<ThemeSource>('manual');
  const [manualTheme, setManualTheme] = useState<ThemeName>('dark');
  
  // Initialize system theme
  const [systemTheme, setSystemTheme] = useState<ThemeName>(() => {
    if (isWeb) {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'dark';
    }
    return colorScheme === 'light' ? 'light' : 'dark';
  });

  // Listen for system theme changes on Web
  useEffect(() => {
    if (!isWeb || typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for system theme changes on Native
  useEffect(() => {
    if (!isWeb && colorScheme) {
      setSystemTheme(colorScheme as ThemeName);
    }
  }, [colorScheme]);

  // Determine active theme based on source
  const theme = themeSource === 'system' ? systemTheme : manualTheme;

  const toggleTheme = () => {
    setThemeSource('manual');
    setManualTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSetTheme = (newTheme: ThemeName) => {
    setThemeSource('manual');
    setManualTheme(newTheme);
  };

  const useSystemTheme = () => {
    setThemeSource('system');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme: handleSetTheme,
        isSystemTheme: themeSource === 'system',
        useSystemTheme,
      }}
    >
      <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
        <Theme name={theme}>{children}</Theme>
      </TamaguiProvider>
    </ThemeContext.Provider>
  );
}
