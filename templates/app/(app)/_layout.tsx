import { Slot, usePathname, useRouter } from 'expo-router';
import { YStack, XStack, Button, Text } from 'tamagui';
import { Home, Compass, User, Settings } from '@tamagui/lucide-icons';

const NAV_ITEMS = [
  { label: 'Feed', icon: Home, href: '/home/feed' },
  { label: 'Explore', icon: Compass, href: '/home/explore' },
  { label: 'Profile', icon: User, href: '/home/profile' },
  { label: 'Settings', icon: Settings, href: '/home/settings' },
] as const;

export default function AppLayout() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <YStack flex={1}>
      <YStack flex={1}>
        <Slot />
      </YStack>

      <XStack
        borderTopWidth={1}
        borderTopColor="$borderColor"
        backgroundColor="$background"
        paddingVertical="$2"
        paddingBottom="$3"
        justifyContent="space-around"
      >
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Button
              key={label}
              chromeless
              onPress={() => router.push(href)}
              opacity={isActive ? 1 : 0.45}
            >
              <YStack alignItems="center" gap="$1">
                <Icon size={22} color={isActive ? '$blue10' : '$color'} />
                <Text
                  fontSize="$1"
                  color={isActive ? '$blue10' : '$color'}
                  fontWeight={isActive ? '600' : '400'}
                >
                  {label}
                </Text>
              </YStack>
            </Button>
          );
        })}
      </XStack>
    </YStack>
  );
}
