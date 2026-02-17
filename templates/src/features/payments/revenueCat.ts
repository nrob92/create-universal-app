import Purchases, {
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { ENV } from '~/constants/env';

const ENTITLEMENT_ID = 'premium';

export async function initializeRevenueCat() {
  Purchases.configure({
    apiKey: Platform.OS === 'ios'
      ? ENV.REVENUECAT_IOS_KEY
      : ENV.REVENUECAT_ANDROID_KEY,
  });
}

export async function fetchOfferings() {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
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
