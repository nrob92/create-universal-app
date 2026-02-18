import { useState } from 'react';
import { YStack, XStack, Input, Paragraph, Separator, isWeb, Text } from 'tamagui';
import { useRouter } from 'expo-router';
import { signIn, signUp, signInWithGoogle } from '~/features/auth/auth';
import { PrimaryButton } from '~/interface/buttons/PrimaryButton';
import { PageContainer } from '~/interface/layout/PageContainer';

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      router.push('/home/feed');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <PageContainer>
      <YStack 
        gap="$3" 
        width={isWeb ? 340 : '90%'}
        px="$4"
        alignSelf="center"
      >
        {/* Sushi Logo */}
        <Text fontSize={50} textAlign="center">🍣</Text>
        
        <Text fontWeight="600" fontSize={22} color="$color12" textAlign="center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>

        {error ? (
          <Paragraph color="$red10" fontSize={13}>{error}</Paragraph>
        ) : null}

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          size="$4"
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          size="$4"
        />
        
        {isSignUp && (
          <Input
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            size="$4"
          />
        )}

        <PrimaryButton onPress={handleSubmit} disabled={loading} size="$4">
          {loading 
            ? (isSignUp ? 'Creating...' : 'Signing in...') 
            : (isSignUp ? 'Sign Up' : 'Sign In')}
        </PrimaryButton>

        <XStack alignItems="center" gap="$2">
          <Separator flex={1} />
          <Text color="$color8" fontSize={12}>or</Text>
          <Separator flex={1} />
        </XStack>

        <PrimaryButton 
          onPress={signInWithGoogle} 
          size="$4"
          backgroundColor="$white1"
          borderWidth={1}
          borderColor="$color6"
        >
          <Text color="$color12">Continue with Google</Text>
        </PrimaryButton>

        <XStack justifyContent="center" gap="$1">
          <Text color="$color10" fontSize={14}>
            {isSignUp ? 'Have an account?' : 'No account?'}
          </Text>
          <Text color="$orange10" fontWeight="600" fontSize={14} onPress={toggleMode}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </Text>
        </XStack>
      </YStack>
    </PageContainer>
  );
}
