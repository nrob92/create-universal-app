import { ScrollView, YStack, H1, H3, Paragraph, XStack, Card, Text } from 'tamagui';
import { useRouter } from 'expo-router';
import { Zap, Shield, Layers, ArrowRight } from '@tamagui/lucide-icons';
import { PrimaryButton } from '~/interface/buttons/PrimaryButton';

const FEATURES = [
  {
    icon: Zap,
    title: 'Ship faster',
    description: 'One codebase for iOS, Android, and Web. No trade-offs.',
  },
  {
    icon: Layers,
    title: 'Everything included',
    description: 'Auth, payments, database, and UI — wired up and ready to go.',
  },
  {
    icon: Shield,
    title: 'Production ready',
    description: 'Built on proven tools: Expo, Supabase, Tamagui, and Stripe.',
  },
];

export function OnboardingScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingHorizontal="$5"
        paddingTop="$12"
        paddingBottom="$8"
        gap="$8"
        alignItems="center"
      >
        {/* Hero */}
        <YStack gap="$4" alignItems="center" maxWidth={380}>
          <YStack
            width={64}
            height={64}
            borderRadius="$6"
            backgroundColor="$blue10"
            alignItems="center"
            justifyContent="center"
            marginBottom="$2"
          >
            <Zap size={32} color="white" />
          </YStack>

          <H1 textAlign="center" letterSpacing={-1}>
            Build your app,{'\n'}not boilerplate.
          </H1>

          <Paragraph textAlign="center" color="$gray10" size="$5" lineHeight="$6">
            A universal starter with everything wired up so you can focus on what makes your product unique.
          </Paragraph>
        </YStack>

        {/* Feature highlights */}
        <YStack gap="$3" width="100%" maxWidth={400}>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                bordered
                padding="$4"
                borderRadius="$5"
                backgroundColor="$backgroundStrong"
              >
                <XStack gap="$3" alignItems="flex-start">
                  <YStack
                    width={40}
                    height={40}
                    borderRadius="$4"
                    backgroundColor="$blue3"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Icon size={18} color="$blue10" />
                  </YStack>
                  <YStack flex={1} gap="$1">
                    <H3 fontSize="$4">{feature.title}</H3>
                    <Paragraph color="$gray10" size="$3" lineHeight="$4">
                      {feature.description}
                    </Paragraph>
                  </YStack>
                </XStack>
              </Card>
            );
          })}
        </YStack>

        {/* CTA buttons */}
        <YStack gap="$3" width="100%" maxWidth={400}>
          <PrimaryButton
            onPress={() => router.push('/auth/sign-up')}
            size="$5"
            iconAfter={ArrowRight}
          >
            Get started
          </PrimaryButton>

          <XStack justifyContent="center" gap="$2">
            <Paragraph color="$gray10">Already have an account?</Paragraph>
            <Text
              color="$blue10"
              cursor="pointer"
              onPress={() => router.push('/auth/sign-in')}
              fontWeight="600"
            >
              Sign in
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
