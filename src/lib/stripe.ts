import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (stripePromise === undefined) {
    const publishableKey = process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'];

    if (!publishableKey) {
      console.warn('Stripe publishable key is not set. Stripe functionality will be disabled.');
      stripePromise = Promise.resolve(null);
    } else {
      stripePromise = loadStripe(publishableKey);
    }
  }
  return stripePromise;
};
