import { YStack, H2, Paragraph, Avatar, Separator } from 'tamagui';
import { useAuth } from '~/features/auth/client/useAuth';
import { signOut } from '~/features/auth/auth';
import { usePayments } from '~/features/payments/usePayments';
import { useRouter } from 'one';
import { PrimaryButton } from '~/interface/buttons/PrimaryButton';
import { PageContainer } from '~/interface/layout/PageContainer';

export function ProfileScreen() {
  const { user } = useAuth();
  const { isPro } = usePayments();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

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
          <PrimaryButton width="100%">
            Upgrade to Pro
          </PrimaryButton>
        )}

        <PrimaryButton theme="red" width="100%" onPress={handleSignOut}>
          Sign Out
        </PrimaryButton>
      </YStack>
    </PageContainer>
  );
}
