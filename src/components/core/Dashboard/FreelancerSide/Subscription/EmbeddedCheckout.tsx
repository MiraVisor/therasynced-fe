'use client';

import { StripeEmbeddedCheckout } from '@stripe/stripe-js';
import { useCallback, useEffect, useRef, useState } from 'react';

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
        const checkout: StripeEmbeddedCheckout = await stripe.initEmbeddedCheckout({
          clientSecret: clientSecret,
        });

        if (!mounted) {
          checkout.unmount();
          return;
        }

        embeddedCheckoutRef.current = checkout;

        // Listen for checkout completion
        // Type assertion needed as StripeEmbeddedCheckout type definition may be incomplete
        (checkout as unknown as { on: (event: string, handler: () => void) => void }).on(
          'complete',
          () => {
            if (mounted) {
              onSuccess();
            }
          },
        );

        // Mount th e checkout to the container
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

    void initializeCheckout();

    return () => {
      mounted = false;
      if (embeddedCheckoutRef.current) {
        embeddedCheckoutRef.current.unmount();
        embeddedCheckoutRef.current = null;
      }
    };
  }, [isOpen, clientSecret, onSuccess]);

  const handleClose = useCallback(() => {
    if (embeddedCheckoutRef.current) {
      embeddedCheckoutRef.current.unmount();
      embeddedCheckoutRef.current = null;
    }
    onClose();
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-poppins font-bold">
            Complete Your Subscription
          </DialogTitle>
          <DialogDescription className="text-sm">
            Enter your payment details to complete your subscription. Your payment is processed
            securely by Stripe.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-600 checkout...</p>"
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 animate-in slide-in-from-top duration-200">
              <p className="text-sm font-medium text-red-800 mb-2">Error</p>
              <p className="text-sm text-red-600"
              <button
                onClick={handleClose}
                className="mt-3 text-sm text-red-700 hover:underline"
              >
                Close and try again
              </button>
            </div>
          )}

          <div
            ref={checkoutRef}
            className={isLoading || error ? 'hidden' : 'animate-in fade-in duration-300'}
            id="embedded-checkout"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
