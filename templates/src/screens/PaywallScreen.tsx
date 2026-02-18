import { useState, useEffect } from 'react';
import { ScrollView, YStack, H2, H3, Paragraph, Card, XStack, Text, Separator } from 'tamagui';
import { Platform } from 'react-native';
import { Check, Zap } from '@tamagui/lucide-icons';
import { PrimaryButton } from '~/interface/buttons/PrimaryButton';
import { PageContainer } from '~/interface/layout/PageContainer';
import { LoadingState } from '~/interface/feedback/LoadingState';
import { usePayments } from '~/features/payments/usePayments';
import { supabase } from '~/features/auth/client/supabaseClient';

const PRO_FEATURES = [
  'Unlimited access to all content',
  'Priority customer support',
  'Advanced analytics dashboard',
  'Early access to new features',
  'No ads, ever',
];

interface Plan {
  id: number;
  name: string;
  slug: string;
  price_monthly: number | null;
  price_yearly: number | null;
  currency: string;
  description: string | null;
  features: string[];
  is_active: boolean;
  is_popular?: boolean;
}

type BillingCycle = 'monthly' | 'yearly';

export function PaywallScreen() {
  const { isPro } = usePayments();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [billing, setBilling] = useState<BillingCycle>('monthly');

  useEffect(() => {
    async function fetchPlans() {
      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        // Mark the middle plan as popular
        const tagged = (data ?? []).map((p: Plan, i: number, arr: Plan[]) => ({
          ...p,
          is_popular: arr.length > 1 && i === Math.floor(arr.length / 2),
        }));
        setPlans(tagged);
      }
      setLoading(false);
    }
    fetchPlans();
  }, []);

  const handlePurchase = async (plan: Plan) => {
    setPurchasing(true);
    try {
      if (Platform.OS === 'web') {
        // Stripe web checkout — replace with your price ID mapping
        const { redirectToCheckout } = await import('~/features/payments/stripeWeb');
        await redirectToCheckout({
          priceId: plan.slug, // Map to your Stripe price ID
          successUrl: `${window.location.origin}/home/feed?success=true`,
          cancelUrl: `${window.location.origin}/home/paywall`,
        });
      } else {
        // RevenueCat mobile purchase
        const { fetchOfferings, purchasePackage, checkProStatus } = await import(
          '~/features/payments/revenueCat'
        );
        const packages = await fetchOfferings();
        const pkg = packages[0]; // Use first available package
        if (pkg) {
          await purchasePackage(pkg);
          const isNowPro = await checkProStatus();
          usePayments.getState().setIsPro(isNowPro);
        }
      }
    } catch (err: any) {
      setError(err.message ?? 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const getPrice = (plan: Plan) => {
    if (billing === 'yearly' && plan.price_yearly != null) {
      return plan.price_yearly;
    }
    return plan.price_monthly;
  };

  if (isPro) {
    return (
      <PageContainer>
        <YStack gap="$4" alignItems="center" maxWidth={380} width="100%">
          <YStack
            width={64}
            height={64}
            borderRadius="$6"
            backgroundColor="$blue10"
            alignItems="center"
            justifyContent="center"
          >
            <Zap size={32} color="white" />
          </YStack>
          <H2 textAlign="center">You're on Pro!</H2>
          <Paragraph color="$gray10" textAlign="center">
            You have full access to all premium features. Thank you for your support.
          </Paragraph>
          <Card bordered borderRadius="$5" width="100%" padding="$4">
            <YStack gap="$3">
              <H3 fontSize="$4">Your benefits</H3>
              {PRO_FEATURES.map((f) => (
                <XStack key={f} gap="$2" alignItems="center">
                  <Check size={16} color="$green10" />
                  <Paragraph fontSize="$3">{f}</Paragraph>
                </XStack>
              ))}
            </YStack>
          </Card>
        </YStack>
      </PageContainer>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <YStack padding="$4" gap="$5" paddingBottom="$10" alignItems="center">
        {/* Header */}
        <YStack gap="$2" alignItems="center" maxWidth={380}>
          <H2 textAlign="center">Upgrade to Pro</H2>
          <Paragraph color="$gray10" textAlign="center">
            Unlock everything and build without limits.
          </Paragraph>
        </YStack>

        {/* Billing toggle */}
        <XStack
          backgroundColor="$backgroundStrong"
          borderRadius="$10"
          padding="$1"
          gap="$1"
        >
          {(['monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
            <XStack
              key={cycle}
              paddingHorizontal="$4"
              paddingVertical="$2"
              borderRadius="$10"
              backgroundColor={billing === cycle ? '$blue10' : 'transparent'}
              onPress={() => setBilling(cycle)}
              cursor="pointer"
              animation="quick"
              gap="$2"
              alignItems="center"
            >
              <Text
                color={billing === cycle ? 'white' : '$gray10'}
                fontWeight="600"
                fontSize="$3"
                textTransform="capitalize"
              >
                {cycle}
              </Text>
              {cycle === 'yearly' && (
                <XStack
                  backgroundColor={billing === 'yearly' ? 'rgba(255,255,255,0.2)' : '$green3'}
                  paddingHorizontal="$2"
                  paddingVertical="$0.5"
                  borderRadius="$10"
                >
                  <Text
                    fontSize="$1"
                    fontWeight="700"
                    color={billing === 'yearly' ? 'white' : '$green10'}
                  >
                    Save 20%
                  </Text>
                </XStack>
              )}
            </XStack>
          ))}
        </XStack>

        {/* Plan cards */}
        <LoadingState loading={loading} error={error}>
          <YStack gap="$3" width="100%" maxWidth={400}>
            {plans.map((plan) => {
              const price = getPrice(plan);
              return (
                <YStack key={plan.id} position="relative">
                  {plan.is_popular && (
                    <XStack
                      position="absolute"
                      top={-10}
                      alignSelf="center"
                      zIndex={10}
                      backgroundColor="$blue10"
                      paddingHorizontal="$3"
                      paddingVertical="$1"
                      borderRadius="$10"
                    >
                      <Text color="white" fontSize="$2" fontWeight="700">
                        Most Popular
                      </Text>
                    </XStack>
                  )}
                  <Card
                    bordered
                    padding="$4"
                    borderRadius="$5"
                    borderColor={plan.is_popular ? '$blue8' : '$borderColor'}
                    borderWidth={plan.is_popular ? 2 : 1}
                  >
                    <YStack gap="$3">
                      <XStack justifyContent="space-between" alignItems="flex-start">
                        <YStack gap="$1">
                          <Text fontWeight="700" fontSize="$5">{plan.name}</Text>
                          {plan.description && (
                            <Paragraph color="$gray10" fontSize="$3">
                              {plan.description}
                            </Paragraph>
                          )}
                        </YStack>
                        {price != null && (
                          <YStack alignItems="flex-end">
                            <XStack alignItems="baseline" gap="$1">
                              <Text fontWeight="800" fontSize="$8" color="$blue10">
                                ${price}
                              </Text>
                              <Text color="$gray10" fontSize="$2">
                                /{billing === 'yearly' ? 'yr' : 'mo'}
                              </Text>
                            </XStack>
                          </YStack>
                        )}
                      </XStack>

                      <Separator />

                      <YStack gap="$2">
                        {plan.features.map((feature, i) => (
                          <XStack key={i} gap="$2" alignItems="center">
                            <Check size={15} color="$green10" />
                            <Paragraph fontSize="$3">{feature}</Paragraph>
                          </XStack>
                        ))}
                      </YStack>

                      <PrimaryButton
                        onPress={() => handlePurchase(plan)}
                        disabled={purchasing}
                        theme={plan.is_popular ? undefined : 'gray'}
                      >
                        {purchasing ? 'Processing...' : `Get ${plan.name}`}
                      </PrimaryButton>
                    </YStack>
                  </Card>
                </YStack>
              );
            })}
          </YStack>
        </LoadingState>

        <Paragraph color="$gray9" fontSize="$2" textAlign="center">
          Cancel anytime. No hidden fees.
        </Paragraph>
      </YStack>
    </ScrollView>
  );
}
