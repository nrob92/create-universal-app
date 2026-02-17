import { YStack, H1, Paragraph, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '~/interface/buttons/PrimaryButton';
import { PageContainer } from '~/interface/layout/PageContainer';

export function OnboardingScreen() {
  const router = useRouter();

  return (
    <PageContainer>
      <YStack gap="$4" alignItems="center" maxWidth={400}>
        <H1 textAlign="center">Welcome</H1>
        <Paragraph textAlign="center" color="$gray10" size="$5">
          Build cross-platform apps with a single codebase.
          Get started by signing in or creating an account.
        </Paragraph>

        <XStack gap="$3" marginTop="$4">
          <PrimaryButton onPress={() => router.push('/auth/sign-in')}>
            Sign In
          </PrimaryButton>
          <PrimaryButton onPress={() => router.push('/auth/sign-up')} theme="gray">
            Sign Up
          </PrimaryButton>
        </XStack>
      </YStack>
    </PageContainer>
  );
}
