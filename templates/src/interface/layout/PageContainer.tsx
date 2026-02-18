import { type ReactNode } from 'react';
import { YStack, View } from 'tamagui';

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
      {/* Modern subtle gradient orbs */}
      <View position="absolute" top={-100} left={-100} width={350} height={350} borderRadius={175} backgroundColor="$orange9" opacity={0.15} />
      <View position="absolute" top={-50} right={-50} width={200} height={200} borderRadius={100} backgroundColor="$orange10" opacity={0.1} />
      <View position="absolute" bottom={-100} right={-100} width={350} height={350} borderRadius={175} backgroundColor="$orange9" opacity={0.15} />
      <View position="absolute" bottom={-50} left={-50} width={200} height={200} borderRadius={100} backgroundColor="$orange10" opacity={0.1} />
      
      {/* Subtle center glow */}
      <View position="absolute" width={600} height={600} borderRadius={300} backgroundColor="$orange8" opacity={0.05} />
      
      {/* Content */}
      <YStack
        flex={1}
        width="100%"
        alignItems="center"
        justifyContent="center"
        pb="$8"
        zIndex={1}
      >
        {children}
      </YStack>
    </YStack>
  );
}
