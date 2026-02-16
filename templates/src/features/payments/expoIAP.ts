import {
  initConnection,
  getProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type ProductPurchase,
  type PurchaseError,
  type Product,
} from 'react-native-iap';

// Update these SKUs to match your App Store Connect / Google Play Console products
const PRODUCT_SKUS = ['premium_monthly', 'premium_yearly'];

export async function initializeIAP() {
  await initConnection();
}

export async function fetchProducts(): Promise<Product[]> {
  return getProducts({ skus: PRODUCT_SKUS });
}

export async function purchaseProduct(sku: string) {
  await requestPurchase({ sku });
}

export function setupPurchaseListeners(
  onSuccess: (purchase: ProductPurchase) => void,
  onError: (error: PurchaseError) => void,
) {
  const updateSub = purchaseUpdatedListener(async (purchase) => {
    await finishTransaction({ purchase });
    onSuccess(purchase);
  });

  const errorSub = purchaseErrorListener((error) => {
    onError(error);
  });

  return () => {
    updateSub.remove();
    errorSub.remove();
  };
}
