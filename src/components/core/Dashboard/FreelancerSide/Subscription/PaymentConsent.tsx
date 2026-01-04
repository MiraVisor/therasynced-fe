'use client';

import { ExternalLink, Info } from 'lucide-react';
import Link from 'next/link';

import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentConsentProps {
  /**
   * Monthly subscription price (e.g., 4.99)
   */
  monthlyPrice?: number;
  /**
   * Currency code (default: EUR)
   */
  currency?: string;
  /**
   * Callback when user accepts (clickwrap - clicking button = acceptance)
   * No longer needed for checkbox state, but kept for backward compatibility
   */
  onConsentChange?: (hasAuthorization: boolean) => void;
  className?: string;
}

export function PaymentConsent({
  monthlyPrice,
  currency = 'EUR',
  onConsentChange,
  className = '',
}: PaymentConsentProps) {
  // Automatically set authorization to true (clickwrap - button click = acceptance)
  // This component now just displays information
  if (onConsentChange) {
    onConsentChange(true);
  }

  const priceText = monthlyPrice
    ? `${currency} ${monthlyPrice.toFixed(2)}/month`
    : 'subscription billing';

  return (
    <div className={`space-y-3 ${className}`}>
      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-900/20">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <div className="space-y-2">
            <p className="font-medium">Payment Authorization & Billing Agreement</p>
            <p className="text-sm">
              By proceeding, you authorise recurring subscription payments of{' '}
              <strong>{priceText}</strong> processed by Stripe in accordance with our{' '}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-900 dark:hover:text-blue-100"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-900 dark:hover:text-blue-100"
              >
                Privacy Policy
              </Link>
              . This authorisation remains valid until you cancel.
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Your payment information is securely processed by Stripe, a PCI DSS Level 1 certified
              payment processor. We do not store your card details on our servers.
            </p>
            <div className="flex flex-wrap gap-4 text-xs pt-1">
              <Link
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-700 underline hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
              >
                Stripe Privacy Policy
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
