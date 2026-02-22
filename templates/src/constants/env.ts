export const ENV = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  STRIPE_PUBLIC_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY ?? '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
  REVENUECAT_IOS_KEY: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
  EXPO_PUBLIC_STRIPE_PRICE_BASIC_ID: process.env.EXPO_PUBLIC_STRIPE_PRICE_BASIC_ID ?? '',
  EXPO_PUBLIC_STRIPE_PRICE_PRO_ID: process.env.EXPO_PUBLIC_STRIPE_PRICE_PRO_ID ?? '',
  EXPO_PUBLIC_STRIPE_PRICE_PREMIUM_ID: process.env.EXPO_PUBLIC_STRIPE_PRICE_PREMIUM_ID ?? '',
} as const;

const REQUIRED_KEYS: (keyof typeof ENV)[] = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'STRIPE_PUBLIC_KEY'];

export function validateEnv() {
  const missing = REQUIRED_KEYS.filter((key) => !ENV[key]);
  if (missing.length > 0) {
    console.warn(
      '[env] Missing required environment variables: ' + missing.join(', ') +
      '\nCopy .env.example to .env and fill in your keys.'
    );
  }
}
