import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { ENV } from '~/constants/env';

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
}) {
  const stripe = await getStripe();
  if (!stripe) throw new Error('Stripe failed to load');

  const { error } = await stripe.redirectToCheckout({
    lineItems: [{ price: params.priceId, quantity: 1 }],
    mode: 'payment',
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
  });

  if (error) throw error;
}

export { getStripe };
