import { create } from 'zustand';
import { Platform } from 'react-native';
import * as RevenueCat from './revenueCat';
import * as StripeWeb from './stripeWeb';

interface PackageInfo {
  id: string;
  title: string;
  description: string;
  priceString: string;
  rcPackage?: any; // RevenueCat specific
  stripePriceId?: string; // Stripe specific
}

interface BillingState {
  isPro: boolean;
  loading: boolean;
  packages: PackageInfo[];
  setIsPro: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  
  // Unified Actions
  initialize: () => Promise<void>;
  fetchPackages: () => Promise<void>;
  purchasePackage: (pkg: PackageInfo) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

export const useBilling = create<BillingState>((set, get) => ({
  isPro: false,
  loading: false,
  packages: [],
  
  setIsPro: (value) => set({ isPro: value }),
  setLoading: (value) => set({ loading: value }),

  initialize: async () => {
    if (Platform.OS === 'web') {
      // Stripe doesn't need strict init like RC, but we could verify key here
      await StripeWeb.getStripe();
    } else {
      await RevenueCat.initializeRevenueCat();
      try {
        const isPro = await RevenueCat.checkProStatus();
        set({ isPro });
      } catch (e) {
        console.error("Failed to check RC status", e);
      }
    }
  },

  fetchPackages: async () => {
    set({ loading: true });
    try {
      if (Platform.OS === 'web') {
        // In a real app, you would fetch these from your backend or Stripe API
        // For the boilerplate, we use dummy data
        set({ 
          packages: [{
            id: 'monthly',
            title: 'Pro Monthly',
            description: 'Unlock all features',
            priceString: '$9.99/mo',
            stripePriceId: 'price_dummy_monthly'
          }] 
        });
      } else {
        const rcPackages = await RevenueCat.fetchOfferings();
        const mapped = rcPackages.map(pkg => ({
          id: pkg.identifier,
          title: pkg.product.title,
          description: pkg.product.description,
          priceString: pkg.product.priceString,
          rcPackage: pkg
        }));
        set({ packages: mapped });
      }
    } catch (e) {
      console.error("Failed to fetch packages", e);
    } finally {
      set({ loading: false });
    }
  },

  purchasePackage: async (pkg) => {
    set({ loading: true });
    try {
      if (Platform.OS === 'web') {
        if (!pkg.stripePriceId) throw new Error("No Stripe Price ID");
        // Ensure you change these URLs to match your deployed app
        const url = typeof window !== 'undefined' ? window.location.origin : '';
        await StripeWeb.redirectToCheckout({
          priceId: pkg.stripePriceId,
          successUrl: `${url}/home/settings?success=true`,
          cancelUrl: `${url}/home/paywall?canceled=true`
        });
        return false; // Web redirects, so we don't instantly know success here
      } else {
        if (!pkg.rcPackage) throw new Error("No RevenueCat package");
        const info = await RevenueCat.purchasePackage(pkg.rcPackage);
        const isPro = info.entitlements.active['premium'] !== undefined;
        set({ isPro });
        return isPro;
      }
    } catch (e) {
      console.error("Purchase failed", e);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  restorePurchases: async () => {
    if (Platform.OS === 'web') {
      // Stripe handles this via customer portal usually
      console.warn("Restore purchases not supported on web client-side");
      return false;
    }
    
    set({ loading: true });
    try {
      const info = await RevenueCat.restorePurchases();
      const isPro = info.entitlements.active['premium'] !== undefined;
      set({ isPro });
      return isPro;
    } catch (e) {
      console.error("Restore failed", e);
      return false;
    } finally {
      set({ loading: false });
    }
  }
}));

