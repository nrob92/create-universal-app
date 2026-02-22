import { ScrollView, YStack, H2, H3, Paragraph, XStack, Text, View, isWeb } from 'tamagui';
import { Check, Star, Zap, Shield, ArrowLeft } from '@tamagui/lucide-icons';
import { Button } from '~/components/ui/Button';
import { PageContainer } from '~/components/layout/PageContainer';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePackages, usePurchase, PackageInfo } from '~/features/payments/useBilling';
import { useAuth } from '~/features/auth/client/useAuth';
import { useState } from 'react';

const FEATURES = [
  { title: 'Unlimited Sushi Orders', icon: Zap, description: 'No limits on how many rolls you can explore.' },
  { title: 'Exclusive Masterclass', icon: Star, description: 'Access private guides from world-class chefs.' },
  { title: 'Priority Delivery', icon: Shield, description: 'Your sushi arrives first, every single time.' },
];

export function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // React Query hooks
  const { data: packages = [], isLoading: isLoadingPackages } = usePackages();
  const { mutateAsync: purchasePackage, isPending: isPurchasing } = usePurchase();
  const [selectedPackage, setSelectedPackage] = useState<PackageInfo | null>(null);
  
  const user = useAuth((s) => s.user);

  // Set default selected package when they load
  if (!selectedPackage && packages.length > 0) {
    const defaultPkg = packages.find(p => p.id === 'pro') || packages[0];
    setSelectedPackage(defaultPkg);
  }

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    if (!user) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
    }
    await purchasePackage({ pkg: selectedPackage, userId: user.id });
  };

  const isLoading = isLoadingPackages || isPurchasing;

  return (
    <PageContainer backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
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
                
                {packages.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    const isPopular = pkg.id === 'pro'; // Hardcoded popular check for now

                    return (
                        <YStack 
                            key={pkg.id}
                            backgroundColor={isSelected ? "$brandPrimary" : "$backgroundStrong"} 
                            p="$5" 
                            borderRadius="$9" 
                            borderWidth={2} 
                            borderColor={isSelected ? "$brandPrimary" : "$borderColor"}
                            position="relative"
                            onPress={() => setSelectedPackage(pkg)}
                            opacity={isLoading ? 0.5 : 1}
                            pressStyle={{ scale: 0.98 }}
                            animation="quick"
                        >
                            {isPopular && (
                                <View 
                                    position="absolute" 
                                    top={-12} 
                                    right={20} 
                                    backgroundColor={isSelected ? "white" : "$brandPrimary"} 
                                    px="$3" 
                                    py="$1" 
                                    borderRadius="$10"
                                >
                                    <Text color={isSelected ? "$brandPrimary" : "white"} fontWeight="800" fontSize={10} textTransform="uppercase">Most Popular</Text>
                                </View>
                            )}

                            <XStack justifyContent="space-between" alignItems="center">
                                <YStack>
                                    <Text fontWeight="800" fontSize={20} color={isSelected ? "white" : "$color"}>{pkg.title}</Text>
                                    <Text color={isSelected ? "rgba(255,255,255,0.8)" : "$gray10"} fontSize={14}>{pkg.description}</Text>
                                </YStack>
                                <YStack alignItems="flex-end">
                                    <Text fontSize={24} fontWeight="900" color={isSelected ? "white" : "$color"}>{pkg.priceString.split('/')[0]}</Text>
                                    <Text color={isSelected ? "rgba(255,255,255,0.8)" : "$gray9"} fontSize={12}>/{pkg.priceString.split('/')[1] || 'month'}</Text>
                                </YStack>
                            </XStack>
                        </YStack>
                    );
                })}

                {packages.length === 0 && !isLoading && (
                    <Text textAlign="center" color="$gray10">No plans available.</Text>
                )}
            </YStack>

            {/* Action Buttons */}
            <YStack gap="$4">
                <Button 
                    variant="primary" 
                    sized="large" 
                    shadowColor="$brandPrimary" 
                    shadowRadius={20}
                    loading={isLoading}
                    disabled={!selectedPackage}
                    onPress={handlePurchase}
                    opacity={!selectedPackage ? 0.5 : 1}
                >
                    {selectedPackage ? `Start with ${selectedPackage.title}` : 'Select a Plan'}
                </Button>
                <Paragraph color="$gray9" fontSize={12} textAlign="center" paddingHorizontal="$4">
                    By subscribing, you agree to our Terms of Service and Privacy Policy.
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

