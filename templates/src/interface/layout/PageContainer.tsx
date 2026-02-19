import { type ReactNode } from 'react';
import { styled, YStack, View, isWeb } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Responsive page container with theme-aware background.
 */
export const PageContainer = styled(YStack, {
  position: 'relative',
  mx: 'auto',
  flex: 1,
  flexBasis: 'auto',
  width: '100%',
  backgroundColor: '$background',

  $md: {
    maw: 760,
  },
  $lg: {
    maw: 860,
  },
  $xl: {
    maw: 1140,
  },
});

interface AuthPageContainerProps {
  children: ReactNode;
}

/**
 * Auth page container with immersive sushi-themed background.
 */
export function AuthPageContainer({ children }: AuthPageContainerProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      position="relative"
      overflow="hidden"
    >
      {/* Immersive Background Elements */}
      <View
        position="absolute"
        top={-100}
        right={-50}
        width={400}
        height={400}
        borderRadius={200}
        backgroundColor="$brandPrimary"
        opacity={0.08}
        animation="lazy"
        enterStyle={{ opacity: 0, scale: 0.8, y: -50 }}
      />
      <View
        position="absolute"
        bottom={-150}
        left={-100}
        width={500}
        height={500}
        borderRadius={250}
        backgroundColor="$brandSecondary"
        opacity={0.05}
        animation="lazy"
        enterStyle={{ opacity: 0, scale: 0.8, y: 50 }}
      />
      
      {/* Subtle Grid Pattern for Web */}
      {isWeb && (
        <View 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          opacity={0.02}
          style={{
            backgroundImage: 'radial-gradient($color 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      )}

      <YStack
        flex={1}
        width="100%"
        alignItems="center"
        justifyContent="center"
        paddingHorizontal="$5"
        paddingTop={isWeb ? 0 : insets.top}
        paddingBottom={isWeb ? 0 : insets.bottom}
        zIndex={1}
      >
        {children}
      </YStack>
    </YStack>
  );
}

/**
 * Page wrapper that handles safe areas.
 */
export function SafePage({ children, ...props }: any) {
  const insets = useSafeAreaInsets();
  return (
    <PageContainer
      paddingTop={isWeb ? 0 : insets.top}
      {...props}
    >
      {children}
    </PageContainer>
  );
}
