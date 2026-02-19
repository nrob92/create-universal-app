import { useState } from 'react';
import { YStack, XStack, Paragraph, Separator, isWeb, Text, View, H2, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { signIn, signUp, signInWithGoogle } from '~/features/auth/auth';
import { useAuth } from '~/features/auth/client/useAuth';
import { Button } from '~/interface/buttons/Button';
import { InputField, PasswordInput } from '~/interface/forms/Input';
import { AuthPageContainer } from '~/interface/layout/PageContainer';
import { haptics } from '~/helpers/haptics';

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const router = useRouter();
  const signInAsDemo = useAuth((s) => s.signInAsDemo);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    haptics.medium();
    try {
      await signInWithGoogle();
    } catch (err: any) {
      haptics.error();
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      haptics.error();
      return;
    }

    setLoading(true);
    setError('');
    haptics.medium();
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      haptics.success();
      router.push('/home/feed');
    } catch (err: any) {
      haptics.error();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError('');
    haptics.medium();
    try {
      // Use mock demo login that bypasses Supabase
      await signInAsDemo();
      haptics.success();
      router.push('/home/feed');
    } catch (err: any) {
      haptics.error();
      setError(err.message);
    } finally {
      setDemoLoading(false);
    }
  };

  const toggleMode = () => {
    haptics.light();
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <AuthPageContainer>
      <ScrollView 
        width="100%" 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <YStack
          width="100%"
          maxWidth={isWeb ? 440 : '100%'}
          alignSelf="center"
          gap={isWeb ? "$8" : "$6"}
          paddingVertical="$6"
          animation="quick"
          enterStyle={{ opacity: 0, y: 20, scale: 0.98 }}
        >
          {/* Brand Header */}
          <YStack alignItems="center" gap="$3">
            <View 
              backgroundColor="$brandPrimary" 
              width={isWeb ? 100 : 80} 
              height={isWeb ? 100 : 80} 
              borderRadius={isWeb ? 50 : 40} 
              alignItems="center" 
              justifyContent="center"
              shadowColor="$brandPrimary"
              shadowRadius={30}
              shadowOpacity={0.4}
              animation="bouncy"
              enterStyle={{ scale: 0.5, rotate: '-10deg' }}
            >
              <Text fontSize={isWeb ? 50 : 40}>🍣</Text>
            </View>
            <YStack alignItems="center" gap="$1">
              <Text fontWeight="900" fontSize={isWeb ? 42 : 32} color="$color" letterSpacing={-2}>
                UniStack
              </Text>
              <XStack gap="$2" alignItems="center">
                  <View width={20} height={2} backgroundColor="$brandSecondary" borderRadius={1} />
                  <Text color="$gray10" fontWeight="800" fontSize={10} textTransform="uppercase" letterSpacing={2}>
                      The Sushi Club
                  </Text>
                  <View width={20} height={2} backgroundColor="$brandSecondary" borderRadius={1} />
              </XStack>
            </YStack>
          </YStack>

          {/* Auth Card */}
          <YStack
            backgroundColor="$backgroundStrong"
            borderRadius="$10"
            borderWidth={1}
            borderColor="$borderColor"
            p={isWeb ? "$8" : "$6"}
            gap="$6"
            shadowColor="$black1"
            shadowRadius={40}
            shadowOpacity={0.2}
          >
            <YStack gap="$1">
              <H2 fontWeight="900" fontSize={22} letterSpacing={-0.5}>
                {isSignUp ? 'Create Membership' : 'Welcome Back'}
              </H2>
              <Paragraph color="$gray10" fontWeight="600" fontSize={13}>
                {isSignUp ? 'Join the finest sushi community' : 'Your table is ready for you'}
              </Paragraph>
            </YStack>

            {error ? (
              <View backgroundColor="rgba(214, 40, 40, 0.1)" p="$4" borderRadius="$5" borderWidth={1} borderColor="$brandTuna">
                <Paragraph color="$brandTuna" fontSize={13} textAlign="center" fontWeight="700">
                  {error}
                </Paragraph>
              </View>
            ) : null}

            <YStack gap="$4">
              <InputField
                label="Email Address"
                placeholder="name@sushiclub.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <PasswordInput
                label="Secret Key"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
              />

              {isSignUp && (
                <PasswordInput
                  label="Confirm Key"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              )}

              <Button 
                onPress={handleSubmit} 
                disabled={loading} 
                variant="primary" 
                sized="large" 
                marginTop="$4"
                shadowColor="$brandPrimary"
                shadowRadius={15}
              >
                {loading ? (isSignUp ? 'Creating...' : 'Signing in...') : isSignUp ? 'Join the Club' : 'Enter Restaurant'}
              </Button>
            </YStack>

            <XStack alignItems="center" gap="$4" py="$2">
              <Separator flex={1} />
              <Text color="$gray8" fontSize={10} fontWeight="800" letterSpacing={1}>OR CONTINUE WITH</Text>
              <Separator flex={1} />
            </XStack>

            <XStack gap="$3">
              <Button
                onPress={handleDemoLogin}
                disabled={demoLoading}
                variant="secondary"
                flex={1}
              >
                Demo
              </Button>

              <Button 
                  variant="outlined" 
                  onPress={handleGoogleLogin}
                  disabled={googleLoading}
                  flex={1}
                  borderColor="$borderColor"
              >
                {googleLoading ? 'Connecting...' : 'Google'}
              </Button>
            </XStack>
          </YStack>

          {/* Footer */}
          <XStack justifyContent="center" gap="$2" paddingBottom="$4">
            <Text color="$gray10" fontSize={14} fontWeight="600">
              {isSignUp ? 'Already a member?' : 'New to the club?'}
            </Text>
            <Text 
              color="$brandPrimary" 
              fontWeight="800" 
              fontSize={14} 
              onPress={toggleMode}
              pressStyle={{ opacity: 0.7 }}
            >
              {isSignUp ? 'Sign In' : 'Join Now'}
            </Text>
          </XStack>
        </YStack>
      </ScrollView>
    </AuthPageContainer>
  );
}
