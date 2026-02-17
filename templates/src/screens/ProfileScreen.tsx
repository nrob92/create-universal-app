import { YStack, H2, Paragraph, Avatar, Separator } from 'tamagui';
import { useAuth } from '~/features/auth/client/useAuth';
import { usePayments } from '~/features/payments/usePayments';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '~/interface/buttons/PrimaryButton';
import { PageContainer } from '~/interface/layout/PageContainer';

export function ProfileScreen() {
  const { user } = useAuth();
  const { isPro } = usePayments();
  const router = useRouter();

  return (
    <PageContainer>
      <YStack gap="$4" alignItems="center" width={320}>
        <Avatar circular size="$10">
          <Avatar.Fallback backgroundColor="$blue10" />
        </Avatar>

        <H2>{user?.email ?? 'Guest'}</H2>
        <Paragraph color="$gray10">
          {isPro ? 'Pro Member' : 'Free Tier'}
        </Paragraph>

        <Separator width="100%" />

        {!isPro && (
          <PrimaryButton width="100%" onPress={() => router.push('/home/paywall')}>
            Upgrade to Pro
          </PrimaryButton>
        )}
      </YStack>
    </PageContainer>
  );
}
