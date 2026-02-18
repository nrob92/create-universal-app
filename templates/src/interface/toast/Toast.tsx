import { ToastProvider as TamaguiToastProvider, Toast, ToastViewport, useToastController, useToastState } from '@tamagui/toast';
import { type ReactNode } from 'react';
import { YStack } from 'tamagui';

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  return (
    <TamaguiToastProvider swipeDirection="horizontal">
      <ToastViewport />
      {children}
    </TamaguiToastProvider>
  );
};

export function showToast(title: string, message?: string) {
  const controller = useToastController();
  controller.show({
    title,
    ...(message && { message }),
  });
}
