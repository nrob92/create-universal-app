/**
 * Sign in as demo user for development/testing
 * 
 * This function creates a demo user if it doesn't exist and signs them in.
 * Useful for quickly testing the app without creating a real account.
 */

import { supabase } from './client/supabaseClient';
import { DEMO_CREDENTIALS } from '~/helpers/isDemoMode';

export async function signInAsDemo() {
  // Try to sign up the demo user (will fail if already exists, which is fine)
  const { error: signupError } = await supabase.auth.signUp({
    email: DEMO_CREDENTIALS.email,
    password: DEMO_CREDENTIALS.password,
    options: {
      data: {
        name: DEMO_CREDENTIALS.name,
      },
    },
  });

  // If signup error is not "user already exists", return the error
  if (signupError && !signupError.message.includes('already registered')) {
    return { error: signupError };
  }

  // Sign in with demo credentials
  const { data, error } = await supabase.auth.signInWithPassword({
    email: DEMO_CREDENTIALS.email,
    password: DEMO_CREDENTIALS.password,
  });

  if (error) {
    return { error };
  }

  return { success: true, data };
}
