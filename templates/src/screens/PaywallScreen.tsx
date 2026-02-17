import { useState, useEffect } from 'react';
import { YStack, H2, Paragraph, Card, XStack, Separator } from 'tamagui';
import { Platform } from 'react-native';
import { Check } from '@tamagui/lucide-icons';
import { PrimaryButton } from '~/interface/buttons/PrimaryButton';
import { PageContainer } from '~/interface/layout/PageContainer';
import { LoadingState } from '~/interface/feedback/LoadingState';
import { usePayments } from '~/features/payments/usePayments';
import { supabase } from '~/features/auth/client/supabaseClient';

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
}

export function PaywallScreen() {
  const { isPro } = usePayments();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

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
        setPlans(data ?? []);
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

  if (isPro) {
    return (
      <PageContainer>
        <YStack gap="$3" alignItems="center">
          <H2>You're on Pro!</H2>
          <Paragraph color="$gray10">
            You have access to all premium features.
          </Paragraph>
        </YStack>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <YStack gap="$4" width="100%" maxWidth={400}>
        <YStack gap="$2" alignItems="center">
          <H2>Upgrade to Pro</H2>
          <Paragraph color="$gray10" textAlign="center">
            Unlock all features and get the most out of the app.
          </Paragraph>
        </YStack>

        <LoadingState loading={loading} error={error}>
          <YStack gap="$3">
            {plans.map((plan) => (
              <Card key={plan.id} elevate bordered padding="$4" borderRadius="$4">
                <YStack gap="$3">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Paragraph fontWeight="bold" fontSize="$5">
                      {plan.name}
                    </Paragraph>
                    {plan.price_monthly != null && (
                      <Paragraph fontWeight="bold" fontSize="$6" color="$blue10">
                        ${plan.price_monthly}/mo
                      </Paragraph>
                    )}
                  </XStack>

                  {plan.description && (
                    <Paragraph color="$gray10">{plan.description}</Paragraph>
                  )}

                  <Separator />

                  <YStack gap="$2">
                    {plan.features.map((feature, i) => (
                      <XStack key={i} gap="$2" alignItems="center">
                        <Check size={16} color="$green10" />
                        <Paragraph>{feature}</Paragraph>
                      </XStack>
                    ))}
                  </YStack>

                  <PrimaryButton
                    onPress={() => handlePurchase(plan)}
                    disabled={purchasing}
                  >
                    {purchasing ? 'Processing...' : `Get ${plan.name}`}
                  </PrimaryButton>
                </YStack>
              </Card>
            ))}
          </YStack>
        </LoadingState>
      </YStack>
    </PageContainer>
  );
}
