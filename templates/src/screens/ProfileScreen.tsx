import { ScrollView, YStack, H2, H3, Paragraph, Avatar, XStack, Text, Card, Separator, View, isWeb } from 'tamagui';
import { Star, Settings as SettingsIcon, LogOut, Edit3, ChevronRight, ShoppingBag, Award, Heart } from '@tamagui/lucide-icons';
import { useAuth } from '~/features/auth/client/useAuth';
import { usePayments } from '~/features/payments/usePayments';
import { useRouter } from 'expo-router';
import { Button } from '~/interface/buttons/Button';
import { SafePage } from '~/interface/layout/PageContainer';

const RECENT_ACTIVITY = [
  { id: '1', title: 'Ordered Spicy Tuna Roll', date: 'Oct 24, 2023', icon: ShoppingBag, color: '$brandPrimary' },
  { id: '2', title: 'Earned "Ginger King" Badge', date: 'Oct 20, 2023', icon: Award, color: '$brandAccent' },
  { id: '3', title: 'Favorited Omakase Special', date: 'Oct 15, 2023', icon: Heart, color: '$brandSecondary' },
];

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <YStack alignItems="center" gap="$1" flex={1}>
      <Text fontWeight="900" fontSize={22} color="$color">{value}</Text>
      <Text color="$gray9" fontSize={11} fontWeight="800" textTransform="uppercase" letterSpacing={1}>{label}</Text>
    </YStack>
  );
}

export function ProfileScreen() {
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const { isPro } = usePayments();
  const router = useRouter();

  const displayName = user?.email?.split('@')[0] ?? 'Sushi Lover';

  return (
    <SafePage>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack paddingBottom="$10">
          {/* Decorative Header */}
          <View
            backgroundColor="$brandPrimary"
            height={160}
            borderBottomLeftRadius="$10"
            borderBottomRightRadius="$10"
            position="relative"
            overflow="hidden"
          >
            <View position="absolute" top={-50} right={-30} width={150} height={150} borderRadius={75} backgroundColor="white" opacity={0.1} />
            <XStack justifyContent="flex-end" p="$5">
              <View 
                backgroundColor="rgba(255,255,255,0.2)" 
                p="$2.5" 
                borderRadius="$10" 
                onPress={() => router.push('/home/settings')}
              >
                <SettingsIcon size={20} color="white" />
              </View>
            </XStack>
          </View>

          {/* Profile Info Section */}
          <YStack alignItems="center" marginTop={-70} gap="$4" paddingHorizontal="$5">
            <YStack position="relative">
              <Avatar circular size="$14" borderWidth={6} borderColor="$background" shadowColor="$black1" shadowRadius={20} shadowOpacity={0.3}>
                <Avatar.Fallback backgroundColor="$brandPrimary">
                  <Text color="white" fontSize={48} fontWeight="900">
                    {displayName[0]?.toUpperCase()}
                  </Text>
                </Avatar.Fallback>
              </Avatar>
              <View 
                position="absolute" 
                bottom={5} 
                right={5} 
                backgroundColor="$brandSecondary" 
                p="$2" 
                borderRadius="$10" 
                borderWidth={4} 
                borderColor="$background"
              >
                <Edit3 size={16} color="white" />
              </View>
            </YStack>

            <YStack alignItems="center" gap="$1">
              <H2 fontWeight="900" fontSize={34} letterSpacing={-1.5} textTransform="capitalize">
                {displayName}
              </H2>
              <XStack alignItems="center" gap="$2" backgroundColor="$backgroundStrong" px="$4" py="$1.5" borderRadius="$10" borderWidth={1} borderColor="$borderColor">
                <Star size={14} color={isPro ? "$brandAccent" : "$gray8"} fill={isPro ? "$brandAccent" : "transparent"} />
                <Text color="$gray11" fontWeight="800" fontSize={12} textTransform="uppercase" letterSpacing={1}>
                  {isPro ? 'Pro Master' : 'Sushi Novice'}
                </Text>
              </XStack>
            </YStack>

            {/* Stats Card */}
            <XStack 
                width="100%" 
                maxWidth={420} 
                backgroundColor="$backgroundStrong" 
                p="$6" 
                borderRadius="$9" 
                borderWidth={1} 
                borderColor="$borderColor"
                shadowColor="$black1"
                shadowRadius={15}
                shadowOpacity={0.05}
            >
              <StatItem value="142" label="Orders" />
              <Separator vertical marginHorizontal="$2" borderColor="$borderColor" opacity={0.5} />
              <StatItem value="5.2k" label="Points" />
              <Separator vertical marginHorizontal="$2" borderColor="$borderColor" opacity={0.5} />
              <StatItem value="18" label="Badges" />
            </XStack>

            {/* Pro Banner */}
            {!isPro && (
              <YStack
                width="100%"
                maxWidth={420}
                backgroundColor="$brandPrimary"
                padding="$6"
                borderRadius="$9"
                gap="$4"
                shadowColor="$brandPrimary"
                shadowRadius={25}
                shadowOpacity={0.3}
              >
                <XStack justifyContent="space-between" alignItems="center">
                    <YStack gap="$1" flex={1}>
                        <H3 color="white" fontSize={22} fontWeight="900">Get Pro Master</H3>
                        <Paragraph color="rgba(255,255,255,0.9)" fontSize={14} fontWeight="600" lineHeight={20}>
                            Unlock free delivery and double points on every Salmon Roll.
                        </Paragraph>
                    </YStack>
                    <Star size={40} color="white" opacity={0.3} fill="white" />
                </XStack>
                <Button
                  backgroundColor="white"
                  sized="medium"
                  onPress={() => router.push('/home/paywall')}
                >
                  <Text color="$brandPrimary" fontWeight="900">Upgrade for $9.99</Text>
                </Button>
              </YStack>
            )}

            {/* Activity List */}
            <YStack width="100%" maxWidth={420} gap="$4" marginTop="$2">
              <XStack justifyContent="space-between" alignItems="flex-end" px="$2">
                <H3 fontSize={20} fontWeight="900" letterSpacing={-0.5}>Recent Activity</H3>
                <Text color="$brandPrimary" fontWeight="800" fontSize={13}>View All</Text>
              </XStack>
              
              <YStack backgroundColor="$backgroundStrong" borderRadius="$9" borderWidth={1} borderColor="$borderColor" overflow="hidden">
                {RECENT_ACTIVITY.map((activity, idx) => (
                  <YStack key={activity.id}>
                    <XStack 
                        padding="$4"
                        alignItems="center"
                        gap="$4"
                        pressStyle={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    >
                        <View backgroundColor={activity.color} p="$2.5" borderRadius="$6" opacity={0.15}>
                            <activity.icon size={18} color={activity.color} />
                        </View>
                        <YStack flex={1} gap="$0.5">
                            <Text fontWeight="800" fontSize={15}>{activity.title}</Text>
                            <Text color="$gray10" fontSize={12} fontWeight="600">{activity.date}</Text>
                        </YStack>
                        <ChevronRight size={16} color="$gray8" />
                    </XStack>
                    {idx < RECENT_ACTIVITY.length - 1 && <Separator borderColor="$borderColor" opacity={0.5} />}
                  </YStack>
                ))}
              </YStack>
            </YStack>

            {/* Logout Button */}
            <YStack width="100%" maxWidth={420} marginTop="$6" alignItems="center" gap="$2">
              <View 
                paddingVertical="$3" 
                paddingHorizontal="$6" 
                borderRadius="$10" 
                onPress={signOut}
                pressStyle={{ scale: 0.97, backgroundColor: 'rgba(244, 162, 97, 0.05)' }}
                hoverStyle={{ backgroundColor: 'rgba(244, 162, 97, 0.05)' }}
                animation="quick"
                cursor="pointer"
              >
                <XStack gap="$2" alignItems="center">
                  <LogOut size={16} color="$brandAccent" />
                  <Text color="$brandAccent" fontWeight="800" fontSize={14} textTransform="uppercase" letterSpacing={1}>
                    Leave the Sushi Club
                  </Text>
                </XStack>
              </View>
              <Text color="$gray8" fontSize={11} fontWeight="600">You can always join back later 🍣</Text>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </SafePage>
  );
}
