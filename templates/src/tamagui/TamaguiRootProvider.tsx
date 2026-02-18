import { type ReactNode, createContext, useContext, useState } from 'react';
import { TamaguiProvider, Theme, isWeb } from 'tamagui';
import tamaguiConfig from './tamagui.config';

export type ThemeName = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeName;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface TamaguiRootProviderProps {
  children: ReactNode;
}

export function TamaguiRootProvider({ children }: TamaguiRootProviderProps) {
  const [theme, setTheme] = useState<ThemeName>('dark');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
        <Theme name={theme}>
          {children}
        </Theme>
      </TamaguiProvider>
    </ThemeContext.Provider>
  );
}
