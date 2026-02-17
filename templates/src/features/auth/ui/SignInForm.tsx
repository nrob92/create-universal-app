import { useState } from 'react';
import { YStack, H2, Input, Paragraph, XStack, Separator } from 'tamagui';
import { useRouter } from 'expo-router';
import { signIn, signInWithGoogle } from '~/features/auth/auth';
import { PrimaryButton } from '~/interface/buttons/PrimaryButton';
import { PageContainer } from '~/interface/layout/PageContainer';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      router.push('/home/feed');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <YStack gap="$4" width={320} alignSelf="center">
        <H2 textAlign="center">Sign In</H2>

        {error ? <Paragraph color="$red10">{error}</Paragraph> : null}

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <PrimaryButton onPress={handleSignIn} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </PrimaryButton>

        <Separator />

        <PrimaryButton onPress={signInWithGoogle} theme="blue">
          Continue with Google
        </PrimaryButton>

        <XStack justifyContent="center" gap="$2">
          <Paragraph>No account?</Paragraph>
          <Paragraph
            color="$blue10"
            cursor="pointer"
            onPress={() => router.push('/auth/sign-up')}
          >
            Sign Up
          </Paragraph>
        </XStack>
      </YStack>
    </PageContainer>
  );
}
