import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { SlideInUp, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SizableText, View, YStack } from 'tamagui';

const BANNER_HEIGHT = 78;
const TOP_OFFSET = 12;
const DEFAULT_DURATION = 3000;

interface ToastData {
  id: number;
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'error' | 'warn';
}

interface ToastContextValue {
  toast: ToastData | null;
  showToast: (title: string, message?: string) => void;
  hideToast: () => void;
}

let toastId = 0;
let showToastFn: ((title: string, message?: string) => void) | null = null;
let hideToastFn: (() => void) | null = null;

export const ToastContext = {
  showToast: (title: string, message?: string) => showToastFn?.(title, message),
  hideToast: () => hideToastFn?.(),
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastData | null>(null);
  const { top } = useSafeAreaInsets();
  
  const translateY = useSharedValue(0);
  const hidden = useSharedValue(false);

  showToastFn = (title: string, message?: string) => {
    setToast({ id: toastId++, title, message });
    hidden.value = false;
  };

  hideToastFn = () => {
    hidden.value = true;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: hidden.value ? 0 : 1,
  }));

  return (
    <>
      {children}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {toast && (
          <Animated.View
            entering={SlideInUp}
            style={[
              {
                top: top + TOP_OFFSET,
                position: 'absolute',
                left: 16,
                right: 16,
                zIndex: 9999,
              },
              animatedStyle,
            ]}
          >
            <Pressable onPress={() => hideToastFn?.()}>
              <YStack
                bg="$color2"
                rounded="$6"
                borderWidth={1}
                borderColor="$color4"
                px="$4"
                py="$3"
              >
                <SizableText size="$4" fontWeight="600" color="$color12">
                  {toast.title}
                </SizableText>
                {toast.message && (
                  <SizableText size="$3" color="$color11">
                    {toast.message}
                  </SizableText>
                )}
              </YStack>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </>
  );
};

export function showToast(title: string, message?: string) {
  showToastFn?.(title, message);
}
