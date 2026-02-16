import { type ReactNode } from 'react';
import { TamaguiProvider, Theme } from 'tamagui';
import tamaguiConfig from './tamagui.config';

interface TamaguiRootProviderProps {
  children: ReactNode;
}

export function TamaguiRootProvider({ children }: TamaguiRootProviderProps) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <Theme name="light">
        {children}
      </Theme>
    </TamaguiProvider>
  );
}
