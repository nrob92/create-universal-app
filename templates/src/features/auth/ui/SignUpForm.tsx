import { useState } from 'react';
import { YStack, H2, Input, Paragraph, XStack, Separator } from 'tamagui';
import { useRouter } from 'expo-router';
import { signUp } from '~/features/auth/auth';
import { PrimaryButton } from '~/interface/buttons/PrimaryButton';
import { PageContainer } from '~/interface/layout/PageContainer';

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await signUp(email, password);
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
        <H2 textAlign="center">Sign Up</H2>

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
        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <PrimaryButton onPress={handleSignUp} disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </PrimaryButton>

        <Separator />

        <XStack justifyContent="center" gap="$2">
          <Paragraph>Already have an account?</Paragraph>
          <Paragraph
            color="$blue10"
            cursor="pointer"
            onPress={() => router.push('/auth/sign-in')}
          >
            Sign In
          </Paragraph>
        </XStack>
      </YStack>
    </PageContainer>
  );
}
