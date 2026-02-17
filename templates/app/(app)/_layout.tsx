import { Slot, usePathname, useRouter } from 'expo-router';
import { YStack, XStack, Button, Text } from 'tamagui';
import { Home, User, Settings } from '@tamagui/lucide-icons';

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
        justifyContent="space-around"
      >
        <Button
          chromeless
          onPress={() => router.push('/home/feed')}
          opacity={pathname.startsWith('/home/feed') ? 1 : 0.5}
        >
          <YStack alignItems="center" gap="$1">
            <Home size={20} />
            <Text fontSize="$1">Feed</Text>
          </YStack>
        </Button>

        <Button
          chromeless
          onPress={() => router.push('/home/profile')}
          opacity={pathname.startsWith('/home/profile') ? 1 : 0.5}
        >
          <YStack alignItems="center" gap="$1">
            <User size={20} />
            <Text fontSize="$1">Profile</Text>
          </YStack>
        </Button>

        <Button
          chromeless
          onPress={() => router.push('/home/settings')}
          opacity={pathname.startsWith('/home/settings') ? 1 : 0.5}
        >
          <YStack alignItems="center" gap="$1">
            <Settings size={20} />
            <Text fontSize="$1">Settings</Text>
          </YStack>
        </Button>
      </XStack>
    </YStack>
  );
}
