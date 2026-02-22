import { create } from 'zustand';
import { Platform } from 'react-native';
import * as RevenueCat from './revenueCat';
import * as StripeWeb from './stripeWeb';
import { ENV } from '~/constants/env';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../auth/client/supabaseClient';
import { useEffect } from 'react';
import { showToast } from '~/components/toast/emitter';

// --- Types ---
export interface PackageInfo {
  id: string;
  title: string;
  description: string;
  priceString: string;
  rcPackage?: any; // RevenueCat specific
  stripePriceId?: string; // Stripe specific
}

// --- Zustand Store (Only for initializing SDKs and holding global fallback state if needed) ---
interface BillingStore {
  isInitialized: boolean;
  initialize: () => Promise<void>;
}

export const useBillingStore = create<BillingStore>((set) => ({
  isInitialized: false,
  initialize: async () => {
    if (Platform.OS === 'web') {
      await StripeWeb.getStripe();
      set({ isInitialized: true });
    } else {
      await RevenueCat.initializeRevenueCat();
      set({ isInitialized: true });
    }
  },
}));

// --- React Query Hooks ---

/**
 * 1. Hook to fetch the user's active subscription status from Supabase
 */
export function useSubscriptionStatus(userId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || Platform.OS !== 'web') return;

    // Listen for realtime updates to the user's subscription
    const channel = supabase
      .channel(`public:subscriptions:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // When a change occurs (e.g. webhook completes), refetch immediately
          queryClient.invalidateQueries({ queryKey: ['subscription', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      if (!userId) return false;

      // Check Mobile first if on Native
      if (Platform.OS !== 'web') {
         return await RevenueCat.checkProStatus();
      }

      // Check Supabase for Web
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, tier')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data ? { status: data.status, tier: data.tier } : null;
    },
    enabled: !!userId, // Only run if we have a user
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * 2. Hook to fetch available packages (Stripe or RevenueCat)
 */
export function usePackages() {
  return useQuery({
    queryKey: ['packages', Platform.OS],
    queryFn: async (): Promise<PackageInfo[]> => {
      if (Platform.OS === 'web') {
        // Return all 3 tiers for Web
        return [
          {
            id: 'basic',
            title: 'Basic Plan',
            description: 'Access to essential features',
            priceString: '$9.99/month',
            stripePriceId: ENV.EXPO_PUBLIC_STRIPE_PRICE_BASIC_ID
          },
          {
            id: 'pro',
            title: 'Pro Plan',
            description: 'Unlock all premium features',
            priceString: '$19.99/month',
            stripePriceId: ENV.EXPO_PUBLIC_STRIPE_PRICE_PRO_ID
          },
          {
            id: 'premium',
            title: 'Premium Plan',
            description: 'Priority support & more',
            priceString: '$49.99/month',
            stripePriceId: ENV.EXPO_PUBLIC_STRIPE_PRICE_PREMIUM_ID
          }
        ];
      } else {
        // RevenueCat real offerings
        const rcPackages = await RevenueCat.fetchOfferings();
        return rcPackages.map((pkg: any) => ({
          id: pkg.identifier,
          title: pkg.product.title,
          description: pkg.product.description,
          priceString: pkg.product.priceString,
          rcPackage: pkg
        }));
      }
    },
    staleTime: Infinity, // Packages rarely change during a session
  });
}

/**
 * 3. Hook to handle the purchase mutation
 */
export function usePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pkg, userId }: { pkg: PackageInfo; userId: string }) => {
      if (Platform.OS === 'web') {
        if (!pkg.stripePriceId) throw new Error("No Stripe Price ID");
        
        const url = typeof window !== 'undefined' ? window.location.origin : '';
        await StripeWeb.redirectToCheckout({
          priceId: pkg.stripePriceId,
          successUrl: `${url}/home/settings?success=true`,
          cancelUrl: `${url}/home/paywall?canceled=true`,
          clientReferenceId: userId,
        });
        
        // Return false here because the web redirects away. 
        // Real success is handled on the return URL.
        return false; 
      } else {
        if (!pkg.rcPackage) throw new Error("No RevenueCat package");
        const info = await RevenueCat.purchasePackage(pkg.rcPackage);
        return info.entitlements.active['premium'] !== undefined;
      }
    },
    onSuccess: (subscriptionData, variables) => {
      // If purchase was successful (mainly for mobile), instantly update the cached status
      if (subscriptionData) {
         queryClient.invalidateQueries({ queryKey: ['subscription', variables.userId] });
      }
    },
    onError: (error) => {
      console.error("Purchase failed", error);
      showToast(error.message || 'Purchase failed. Please try again.', { type: 'error' });
    }
  });
}

/**
 * 4. Hook to handle restoring purchases (Mobile only)
 */
export function useRestorePurchases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (Platform.OS === 'web') {
        throw new Error("Restore purchases not supported on web client-side");
      }
      
      const info = await RevenueCat.restorePurchases();
      return info.entitlements.active['premium'] !== undefined;
    },
    onSuccess: (isPro, userId) => {
      if (isPro) {
         queryClient.setQueryData(['subscription', userId], true);
         showToast('Purchases restored successfully!', { type: 'success' });
      } else {
         showToast('No active subscription found to restore.', { type: 'warning' });
      }
    },
    onError: (error) => {
      console.error("Restore failed", error);
      showToast(error.message || 'Failed to restore purchases.', { type: 'error' });
    }
  });
}

