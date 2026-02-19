import '@tamagui/native/setup-zeego';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TamaguiRootProvider } from '~/tamagui/TamaguiRootProvider';
import { useAuth } from '~/features/auth/client/useAuth';
import { ErrorBoundary } from '~/interface/feedback/ErrorBoundary';
import { Spinner } from '~/interface/feedback/Spinner';
import { validateEnv } from '~/constants/env';
import { PlatformSpecificRootProvider } from '~/interface/platform/PlatformSpecificRootProvider';
import { ToastProvider } from '~/interface/toast/Toast';

WebBrowser.maybeCompleteAuthSession();

validateEnv();

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, isOnboarded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const firstSegment = segments[0];
    const isOnAuthPage = !firstSegment;
    const isOnOnboarding = segments[1] === 'onboarding';
    const isOnHomeRoutes = firstSegment === 'home' || firstSegment === '(app)';

    if (!user && (isOnHomeRoutes || isOnOnboarding)) {
      router.replace('/');
      return;
    }

    if (user) {
      if (!isOnboarded && !isOnOnboarding) {
        router.replace('/onboarding');
        return;
      }
      
      if (isOnboarded && (isOnAuthPage || isOnOnboarding)) {
        router.replace('/home/feed');
        return;
      }
    }
  }, [user, loading, isOnboarded, segments]);

  if (loading) {
    return <Spinner label="Loading..." />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const initialize = useAuth((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiRootProvider>
        <PlatformSpecificRootProvider>
          <ToastProvider>
            <ErrorBoundary>
              <AuthGuard>
                <Slot />
              </AuthGuard>
            </ErrorBoundary>
          </ToastProvider>
        </PlatformSpecificRootProvider>
      </TamaguiRootProvider>
    </QueryClientProvider>
  );
}
