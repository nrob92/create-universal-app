import { ToastProvider as TamaguiToastProvider, Toast, ToastViewport, useToastController, useToastState } from '@tamagui/toast';
import { useEffect, type ReactNode } from 'react';
import { YStack, XStack, View, Text } from 'tamagui';
import { CheckCircle, AlertCircle, Info } from '@tamagui/lucide-icons';
import { addToastListener } from './emitter';

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  return (
    <TamaguiToastProvider swipeDirection="horizontal">
      <ToastViewport top="$8" left={0} right={0} />
      <ToastListenerComponent />
      <CurrentToast />
      {children}
    </TamaguiToastProvider>
  );
};

function ToastListenerComponent() {
  const toast = useToastController();

  useEffect(() => {
    return addToastListener((options) => {
      toast.show(options.message, {
        type: options.type,
        duration: options.duration,
      });
    });
  }, [toast]);

  return null;
}

function CurrentToast() {
  const currentToast = useToastState();

  if (!currentToast || currentToast.isHandledNatively) return null;

  const isError = currentToast.type === 'error';
  const isSuccess = currentToast.type === 'success';
  const Icon = isError ? AlertCircle : isSuccess ? CheckCircle : Info;
  const color = isError ? '$brandTuna' : isSuccess ? '$brandSecondary' : '$brandPrimary';

  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{ opacity: 0, scale: 0.5, y: -20 }}
      exitStyle={{ opacity: 0, scale: 0.5, y: -20 }}
      y={0}
      opacity={1}
      scale={1}
      animation="quick"
      viewportName={currentToast.viewportName}
    >
      <View 
        backgroundColor="$backgroundStrong" 
        p="$4" 
        borderRadius="$10" 
        borderWidth={2} 
        borderColor={color}
        shadowColor="$black1"
        shadowRadius={20}
        shadowOpacity={0.2}
        minWidth={280}
        maxWidth="90%"
        alignSelf="center"
      >
        <XStack gap="$3" alignItems="center">
          <Icon size={20} color={color} />
          <YStack flex={1}>
            <Toast.Title fontWeight="800" fontSize={15} color="$color">
              {currentToast.title}
            </Toast.Title>
            {currentToast.message && (
              <Toast.Description color="$gray10" fontSize={13} fontWeight="600">
                {currentToast.message}
              </Toast.Description>
            )}
          </YStack>
        </XStack>
      </View>
    </Toast>
  );
}

export function showToast(title: string, message?: string) {
  // This is the legacy/hook-based one, we prefer the emitter one now
  const controller = useToastController();
  controller.show(title, {
    message,
  });
}
