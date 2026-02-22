import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { ENV } from '~/constants/env';
import { supabase } from '~/features/auth/client/supabaseClient';

let stripePromise: Promise<Stripe | null>;

function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(ENV.STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
}

export async function redirectToCheckout(params: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  clientReferenceId?: string;
}) {
  const stripe = await getStripe();
  if (!stripe) throw new Error('Stripe failed to load');

  // Call our new Edge Function to create the session
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: {
        priceId: params.priceId,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
        userId: params.clientReferenceId,
    }
  });

  if (error) {
    console.error('Failed to create checkout session:', error);
    throw error;
  }

  if (!data?.sessionId) {
    throw new Error('No session ID returned from server');
  }

  // Redirect using the session ID
  const { error: stripeError } = await stripe.redirectToCheckout({
    sessionId: data.sessionId,
  });

  if (stripeError) throw stripeError;
}

export { getStripe };
