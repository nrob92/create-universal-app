/**
 * Demo mode is enabled in development or when EXPO_PUBLIC_DEMO_MODE=1
 * This allows developers to quickly test the app without creating an account
 */

import Constants from 'expo-constants';

export const isDemoMode =
  Constants.expoConfig?.extra?.demoMode === true ||
  process.env.EXPO_PUBLIC_DEMO_MODE === '1';

/**
 * Demo user credentials
 * These are used for development/testing purposes only
 */
export const DEMO_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'demo123456',
  name: 'Demo User',
};
