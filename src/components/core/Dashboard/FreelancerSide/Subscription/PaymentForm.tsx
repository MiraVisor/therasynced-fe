'use client';

import { Elements } from '@stripe/react-stripe-js';
import { StripeElementsOptions, loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getStripe } from '@/lib/stripe';
import { createSubscription } from '@/redux/api/subscriptionApi';
import { useAppDispatch } from '@/redux/hooks/useAppHooks';
import { PlanType } from '@/types/types';

interface PaymentFormProps {
  clientSecret: string;
  planType: PlanType;
  onSuccess: () => void;
  onCancel: () => void;
}

const stripePromise = getStripe();

const PaymentForm = ({ clientSecret, planType, onSuccess, onCancel }: PaymentFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      // For now, just show success and redirect
      // In production, you would integrate Stripe Elements here
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate payment
      toast.success('Payment successful! Your subscription is now active.');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Complete your payment to activate your <strong>{planType}</strong> subscription.
      </p>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-xs text-gray-500">Stripe payment integration will be added here</p>
      </div>

      <div className="flex gap-3">
        <Button onClick={onCancel} variant="outline" disabled={isProcessing} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handlePayment} disabled={isProcessing} className="flex-1">
          {isProcessing ? 'Processing...' : 'Complete Payment'}
        </Button>
      </div>
    </div>
  );
};

interface PaymentModalProps {
  isOpen: boolean;
  clientSecret: string;
  planType: PlanType;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal = ({
  isOpen,
  clientSecret,
  planType,
  onClose,
  onSuccess,
}: PaymentModalProps) => {
  if (!stripePromise) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Enter your payment details to complete your subscription.
          </DialogDescription>
        </DialogHeader>

        <PaymentForm
          clientSecret={clientSecret}
          planType={planType}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
