import { Slot, usePathname, useRouter } from 'expo-router';
import { YStack, XStack, Text, View, isWeb } from 'tamagui';
import { Home, Compass, User } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebNav } from '~/components/layout/WebNav';
import { haptics } from '~/helpers/haptics';

const NAV_ITEMS = [
  { label: 'Feed', icon: Home, href: '/home/feed' },
  { label: 'Explore', icon: Compass, href: '/home/explore' },
  { label: 'Profile', icon: User, href: '/home/profile' },
] as const;

export function AppLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isOnboarding = pathname === '/onboarding';

  const handleNav = (href: string) => {
    haptics.light();
    router.push(href as any);
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {isWeb && !isOnboarding && <WebNav />}
      
      <View flex={1} paddingTop={isWeb && !isOnboarding ? 70 : 0}>
        <Slot />
      </View>

      {!isWeb && !isOnboarding && (
        <XStack
          borderTopWidth={1}
          borderTopColor="$borderColor"
          backgroundColor="$backgroundStrong"
          paddingTop="$2"
          paddingBottom={insets.bottom + 8}
          justifyContent="space-around"
          shadowColor="$black1"
          shadowRadius={20}
          shadowOpacity={0.1}
        >
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const isActive = pathname.startsWith(href);
            return (
              <YStack 
                key={label} 
                alignItems="center" 
                gap="$1"
                onPress={() => handleNav(href)}
                pressStyle={{ opacity: 0.7, scale: 0.95 }}
                cursor="pointer"
                animation="quick"
                paddingHorizontal="$4"
              >
                <View
                  backgroundColor={isActive ? 'rgba(255,112,81,0.1)' : 'transparent'}
                  paddingVertical="$1.5"
                  paddingHorizontal="$4"
                  borderRadius="$10"
                  animation="quick"
                >
                  <Icon size={24} color={isActive ? '$brandPrimary' : '$gray10'} />
                </View>
                <Text
                  fontSize={11}
                  color={isActive ? '$brandPrimary' : '$gray10'}
                  fontWeight={isActive ? '800' : '600'}
                  textTransform="uppercase"
                  letterSpacing={0.5}
                >
                  {label}
                </Text>
              </YStack>
            );
          })}
        </XStack>
      )}
    </YStack>
  );
}
