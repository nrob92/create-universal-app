import { ScrollView, YStack, H2, H3, Paragraph, XStack, Text, View, LinearGradient, isWeb } from 'tamagui';
import { Check, Star, Zap, Shield, ArrowLeft } from '@tamagui/lucide-icons';
import { Button } from '~/interface/buttons/Button';
import { PageContainer } from '~/interface/layout/PageContainer';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FEATURES = [
  { title: 'Unlimited Sushi Orders', icon: Zap, description: 'No limits on how many rolls you can explore.' },
  { title: 'Exclusive Masterclass', icon: Star, description: 'Access private guides from world-class chefs.' },
  { title: 'Priority Delivery', icon: Shield, description: 'Your sushi arrives first, every single time.' },
];

export function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <PageContainer backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false} bounce={false}>
        <YStack>
          {/* Immersive Header */}
          <View height={350} width="100%" position="relative">
             <View 
                position="absolute" 
                top={0} 
                left={0} 
                right={0} 
                bottom={0} 
                backgroundColor="$brandPrimary"
                borderBottomLeftRadius="$10"
                borderBottomRightRadius="$10"
                overflow="hidden"
             >
                {/* Decorative Pattern / Glow */}
                <View 
                    position="absolute" 
                    top={-50} 
                    right={-50} 
                    width={200} 
                    height={200} 
                    borderRadius={100} 
                    backgroundColor="white" 
                    opacity={0.15} 
                />
             </View>

            <YStack 
                paddingTop={isWeb ? "$6" : insets.top + 10} 
                paddingHorizontal="$5" 
                gap="$6"
                alignItems="center"
            >
              <XStack width="100%" justifyContent="flex-start">
                <View 
                    p="$2" 
                    borderRadius="$10" 
                    backgroundColor="rgba(255,255,255,0.2)"
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={20} color="white" />
                </View>
              </XStack>

              <YStack alignItems="center" gap="$3">
                <View 
                    backgroundColor="white" 
                    p="$4" 
                    borderRadius="$9"
                    shadowColor="$black1"
                    shadowRadius={20}
                    shadowOpacity={0.2}
                >
                    <Star size={40} color="$brandPrimary" fill="$brandPrimary" />
                </View>
                <YStack alignItems="center" gap="$1">
                    <H2 color="white" fontWeight="900" fontSize={38} letterSpacing={-1.5} textAlign="center">
                        PRO MASTER
                    </H2>
                    <View backgroundColor="rgba(255,255,255,0.2)" px="$3" py="$1" borderRadius="$10">
                        <Text color="white" fontWeight="800" fontSize={12} textTransform="uppercase" letterSpacing={1}>
                            Elevate your experience
                        </Text>
                    </View>
                </YStack>
              </YStack>
            </YStack>
          </View>

          {/* Content Section */}
          <YStack 
            paddingHorizontal="$5" 
            marginTop={-40} 
            gap="$8" 
            paddingBottom={insets.bottom + 40}
          >
            {/* Features Card */}
            <YStack 
                backgroundColor="$backgroundStrong" 
                p="$6" 
                borderRadius="$9" 
                borderWidth={1} 
                borderColor="$borderColor"
                gap="$6"
                shadowColor="$black1"
                shadowRadius={30}
                shadowOpacity={0.1}
            >
                {FEATURES.map((feature, idx) => (
                    <XStack key={idx} gap="$4" alignItems="center">
                        <View backgroundColor="rgba(255,112,81,0.1)" p="$2.5" borderRadius="$6">
                            <feature.icon size={20} color="$brandPrimary" />
                        </View>
                        <YStack flex={1}>
                            <Text fontWeight="800" fontSize={16}>{feature.title}</Text>
                            <Text color="$gray10" fontSize={13}>{feature.description}</Text>
                        </YStack>
                    </XStack>
                ))}
            </YStack>

            {/* Plan Selection */}
            <YStack gap="$4">
                <Text color="$gray10" fontWeight="800" fontSize={12} textTransform="uppercase" letterSpacing={1} textAlign="center">
                    Select a Plan
                </Text>
                
                <YStack 
                    backgroundColor="$backgroundStrong" 
                    p="$5" 
                    borderRadius="$9" 
                    borderWidth={2} 
                    borderColor="$brandPrimary"
                    position="relative"
                >
                    <View 
                        position="absolute" 
                        top={-12} 
                        right={20} 
                        backgroundColor="$brandPrimary" 
                        px="$3" 
                        py="$1" 
                        borderRadius="$10"
                    >
                        <Text color="white" fontWeight="800" fontSize={10} textTransform="uppercase">Most Popular</Text>
                    </View>

                    <XStack justifyContent="space-between" alignItems="center">
                        <YStack>
                            <Text fontWeight="800" fontSize={20}>Annual Master</Text>
                            <Text color="$gray10" fontSize={14}>Save 40% yearly</Text>
                        </YStack>
                        <YStack alignItems="flex-end">
                            <Text fontSize={24} fontWeight="900">$5.99</Text>
                            <Text color="$gray9" fontSize={12}>/month</Text>
                        </YStack>
                    </XStack>
                </YStack>

                <YStack 
                    backgroundColor="$backgroundStrong" 
                    p="$5" 
                    borderRadius="$9" 
                    borderWidth={1} 
                    borderColor="$borderColor"
                >
                    <XStack justifyContent="space-between" alignItems="center">
                        <YStack>
                            <Text fontWeight="800" fontSize={20}>Monthly Novice</Text>
                            <Text color="$gray10" fontSize={14}>Flexible, cancel anytime</Text>
                        </YStack>
                        <YStack alignItems="flex-end">
                            <Text fontSize={24} fontWeight="900">$9.99</Text>
                            <Text color="$gray9" fontSize={12}>/month</Text>
                        </YStack>
                    </XStack>
                </YStack>
            </YStack>

            {/* Action Buttons */}
            <YStack gap="$4">
                <Button variant="primary" sized="large" shadowColor="$brandPrimary" shadowRadius={20}>
                    Start 7-Day Free Trial
                </Button>
                <Paragraph color="$gray9" fontSize={12} textAlign="center" paddingHorizontal="$4">
                    By subscribing, you agree to our Terms of Service and Privacy Policy. Your trial will convert to a paid subscription automatically.
                </Paragraph>
            </YStack>

            <XStack justifyContent="center" gap="$6">
                <Text color="$gray10" fontSize={13} fontWeight="700" onPress={() => {}}>Restore</Text>
                <Text color="$gray10" fontSize={13} fontWeight="700" onPress={() => {}}>Privacy</Text>
                <Text color="$gray10" fontSize={13} fontWeight="700" onPress={() => {}}>Terms</Text>
            </XStack>
          </YStack>
        </YStack>
      </ScrollView>
    </PageContainer>
  );
}
