import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { TamaguiRootProvider } from '~/tamagui/TamaguiRootProvider';
import { useAuth } from '~/features/auth/client/useAuth';

export default function RootLayout() {
  const initialize = useAuth((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <TamaguiRootProvider>
      <Slot />
    </TamaguiRootProvider>
  );
}
