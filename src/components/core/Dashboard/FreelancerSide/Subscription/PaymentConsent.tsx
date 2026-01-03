'use client';

import { ExternalLink, Info } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useConsentManager } from '@/hooks/useConsentManager';

interface PaymentConsentProps {
  onConsentChange: (hasConsent: boolean) => void;
  required?: boolean;
  className?: string;
}

export function PaymentConsent({
  onConsentChange,
  required = true,
  className = '',
}: PaymentConsentProps) {
  const { hasConsent, updateConsent } = useConsentManager();
  const paymentConsentGranted = hasConsent('PAYMENT_DATA');

  // Sync consent state with parent component
  useEffect(() => {
    onConsentChange(paymentConsentGranted);
  }, [paymentConsentGranted, onConsentChange]);

  const handleConsentChange = async (checked: boolean) => {
    await updateConsent('PAYMENT_DATA', checked);
    onConsentChange(checked);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-900/20">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <div className="space-y-2">
            <p className="font-medium">Payment Data Processing</p>
            <p className="text-sm">
              Your payment information is securely processed by Stripe, a PCI DSS Level 1 certified
              payment processor. We do not store your card details on our servers.
            </p>
            <div className="flex flex-wrap gap-4 text-xs">
              <Link
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-700 underline hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
              >
                Stripe Privacy Policy
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-700 underline hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
              >
                Our Privacy Policy
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div
        className={`flex items-start space-x-3 rounded-lg border p-4 transition-all duration-200 ${
          required && !paymentConsentGranted
            ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
            : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <Checkbox
          id="payment-consent"
          checked={paymentConsentGranted}
          onCheckedChange={(checked) => handleConsentChange(checked === true)}
          className="mt-1 transition-all duration-200"
          required={required}
        />
        <div className="flex-1 space-y-1">
          <Label
            htmlFor="payment-consent"
            className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I consent to the processing of my payment data by Stripe for subscription payment
            processing
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <p className="text-xs text-muted-foreground">
            By checking this box, you acknowledge that your payment data will be processed by Stripe
            in accordance with their privacy policy and our terms of service. You can withdraw this
            consent at any time by canceling your subscription.
          </p>
        </div>
      </div>

      {required && !paymentConsentGranted && (
        <p className="text-xs text-red-600 dark:text-red-400 animate-in slide-in-from-top duration-200">
          Payment consent is required to proceed with checkout.
        </p>
      )}
    </div>
  );
}
