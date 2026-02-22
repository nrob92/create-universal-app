import Purchases, {
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { ENV } from '~/constants/env';

const ENTITLEMENT_ID = 'premium';

export async function initializeRevenueCat() {
  Purchases.setLogHandler((logLevel, message) => {
    if (
      message.includes('RevenueCat SDK Configuration is not valid') ||
      message.includes('Error fetching offerings') ||
      message.includes('Using a Test Store API key')
    ) {
      return;
    }
    // Still log true errors not related to missing dashboard setup
    if (
      logLevel === Purchases.LOG_LEVEL.ERROR ||
      logLevel === Purchases.LOG_LEVEL.WARN
    ) {
      console.warn(`[RevenueCat] ${message}`);
    }
  });

  Purchases.configure({
    apiKey: Platform.OS === 'ios'
      ? ENV.REVENUECAT_IOS_KEY
      : ENV.REVENUECAT_ANDROID_KEY,
  });
}

export async function fetchOfferings() {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  } catch (error) {
    console.warn('[RevenueCat] Returning empty offerings to prevent crash (no products configured in dashboard).');
    return [];
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

export async function checkProStatus(): Promise<boolean> {
  const customerInfo = await Purchases.getCustomerInfo();
  return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
}
