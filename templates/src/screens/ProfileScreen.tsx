import { ScrollView, YStack, H2, H3, Paragraph, Avatar, XStack, Text, Card, Separator } from 'tamagui';
import { Star } from '@tamagui/lucide-icons';
import { useAuth } from '~/features/auth/client/useAuth';
import { usePayments } from '~/features/payments/usePayments';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '~/interface/buttons/PrimaryButton';

const PLACEHOLDER_ACTIVITY = [
  { id: '1', title: 'Liked a post', timestamp: '2h ago' },
  { id: '2', title: 'Left a comment', timestamp: '5h ago' },
  { id: '3', title: 'Joined the community', timestamp: '3d ago' },
];

interface StatColumnProps {
  value: string;
  label: string;
}

function StatColumn({ value, label }: StatColumnProps) {
  return (
    <YStack alignItems="center" gap="$1" flex={1}>
      <Text fontWeight="700" fontSize="$6">{value}</Text>
      <Paragraph color="$gray10" fontSize="$2">{label}</Paragraph>
    </YStack>
  );
}

export function ProfileScreen() {
  const { user } = useAuth();
  const { isPro } = usePayments();
  const router = useRouter();

  const displayName = user?.email?.split('@')[0] ?? 'Guest';

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <YStack paddingBottom="$8">
        {/* Header band */}
        <YStack
          backgroundColor="$blue10"
          height={100}
        />

        {/* Avatar overlapping band */}
        <YStack alignItems="center" marginTop={-50} gap="$3" paddingHorizontal="$4">
          <Avatar circular size="$12" borderWidth={4} borderColor="$background">
            <Avatar.Fallback backgroundColor="$blue8">
              <Text color="white" fontSize="$8" fontWeight="700">
                {displayName[0]?.toUpperCase()}
              </Text>
            </Avatar.Fallback>
          </Avatar>

          <YStack alignItems="center" gap="$1">
            <H2 textTransform="capitalize">{displayName}</H2>
            <XStack alignItems="center" gap="$1">
              {isPro && <Star size={14} color="$yellow10" fill="$yellow10" />}
              <Paragraph color="$gray10">
                {isPro ? 'Pro Member' : 'Free Tier'}
              </Paragraph>
            </XStack>
          </YStack>

          {/* Stats row */}
          <Card width="100%" maxWidth={380} bordered padding="$4" borderRadius="$5">
            <XStack>
              <StatColumn value="24" label="Posts" />
              <Separator vertical marginHorizontal="$2" />
              <StatColumn value="1.2k" label="Followers" />
              <Separator vertical marginHorizontal="$2" />
              <StatColumn value="348" label="Following" />
            </XStack>
          </Card>

          {/* Pro upsell banner */}
          {!isPro && (
            <Card
              width="100%"
              maxWidth={380}
              backgroundColor="$blue10"
              padding="$4"
              borderRadius="$5"
            >
              <YStack gap="$3">
                <YStack gap="$1">
                  <H3 color="white" fontSize="$5">Unlock Pro features</H3>
                  <Paragraph color="rgba(255,255,255,0.8)" fontSize="$3">
                    Get unlimited access, advanced analytics, and priority support.
                  </Paragraph>
                </YStack>
                <PrimaryButton
                  backgroundColor="white"
                  color="$blue10"
                  onPress={() => router.push('/home/paywall')}
                >
                  Upgrade to Pro
                </PrimaryButton>
              </YStack>
            </Card>
          )}

          {/* Recent Activity */}
          <YStack width="100%" maxWidth={380} gap="$3" marginTop="$2">
            <H3 fontSize="$5">Recent Activity</H3>
            <Card bordered borderRadius="$5" overflow="hidden">
              {PLACEHOLDER_ACTIVITY.map((item, idx) => (
                <YStack key={item.id}>
                  <XStack
                    padding="$4"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Paragraph fontWeight="500">{item.title}</Paragraph>
                    <Paragraph color="$gray9" fontSize="$2">{item.timestamp}</Paragraph>
                  </XStack>
                  {idx < PLACEHOLDER_ACTIVITY.length - 1 && (
                    <Separator />
                  )}
                </YStack>
              ))}
            </Card>
          </YStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
