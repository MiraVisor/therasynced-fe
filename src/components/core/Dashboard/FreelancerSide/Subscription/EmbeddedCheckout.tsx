'use client';

import { StripeEmbeddedCheckout } from '@stripe/stripe-js';
import { useEffect, useRef, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { getStripe } from '@/lib/stripe';

interface EmbeddedCheckoutProps {
  isOpen: boolean;
  clientSecret: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmbeddedCheckout({
  isOpen,
  clientSecret,
  onClose,
  onSuccess,
}: EmbeddedCheckoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const embeddedCheckoutRef = useRef<StripeEmbeddedCheckout | null>(null);

  useEffect(() => {
    if (!isOpen || !clientSecret || !checkoutRef.current) {
      return;
    }

    let mounted = true;

    const initializeCheckout = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const stripe = await getStripe();
        if (!stripe) {
          throw new Error('Stripe failed to initialize');
        }

        // Clear previous checkout if any
        if (embeddedCheckoutRef.current) {
          embeddedCheckoutRef.current.unmount();
          embeddedCheckoutRef.current = null;
        }

        // Initialize embedded checkout with client secret
        const checkout = await stripe.initEmbeddedCheckout({
          clientSecret: clientSecret,
        });

        if (!mounted) {
          checkout.unmount();
          return;
        }

        embeddedCheckoutRef.current = checkout;

        // Mount the checkout to the container
        if (checkoutRef.current) {
          checkout.mount(checkoutRef.current);
        }
        setIsLoading(false);
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize checkout';
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    initializeCheckout();

    return () => {
      mounted = false;
      if (embeddedCheckoutRef.current) {
        embeddedCheckoutRef.current.unmount();
        embeddedCheckoutRef.current = null;
      }
    };
  }, [isOpen, clientSecret, onSuccess]);

  const handleClose = () => {
    if (embeddedCheckoutRef.current) {
      embeddedCheckoutRef.current.unmount();
      embeddedCheckoutRef.current = null;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Complete Your Subscription</DialogTitle>
          <DialogDescription>
            Enter your payment details to complete your subscription.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div
            ref={checkoutRef}
            className={isLoading || error ? 'hidden' : ''}
            id="embedded-checkout"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
