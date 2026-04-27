'use client';

import { Calendar, CreditCard, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Subscription, SubscriptionPlan } from '@/types/subscription';

interface BillingSummaryProps {
  subscription: Subscription;
  plan?: SubscriptionPlan;
  onManageBilling?: () => void;
  onCancel?: () => void;
  onResume?: () => void;
  isLoadingPortal?: boolean;
  className?: string;
}

export function BillingSummary({
  subscription,
  plan,
  onManageBilling,
  onCancel,
  onResume,
  isLoadingPortal = false,
  className = '',
}: BillingSummaryProps) {
  const hasPlan = !!plan;
  const isCanceled = subscription.cancelAtPeriodEnd;
  const isActive = subscription.status === 'ACTIVE';
  const nextBillingDate = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;

  if (!hasPlan || !isActive) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-poppins font-bold">Billing Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {nextBillingDate && (
          <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Next Billing Date
                </p>
                <p className="text-lg font-poppins font-semibold text-charcoal">
                  {nextBillingDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-600">Billing Amount</p>
              <p className="text-lg font-poppins font-semibold text-charcoal">
                EUR {plan.price.toFixed(2)} / month
              </p>
            </div>
          </div>
        </div>

        {isCanceled && nextBillingDate && (
          <div className="rounded-lg border border-orange-500 bg-orange-50 p-4">
            <p className="text-sm font-medium text-orange-800">
              Your subscription will end on{' '}
              {nextBillingDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              . You will retain access until then.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {onManageBilling && (
            <Button
              onClick={onManageBilling}
              variant="outline"
              disabled={isLoadingPortal}
              className="flex-1"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Billing
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          )}
          {!isCanceled && onCancel && (
            <Button onClick={onCancel} variant="destructive" className="flex-1">
              Cancel Subscription
            </Button>
          )}
          {isCanceled && onResume && (
            <Button onClick={onResume} className="flex-1">
              Resume Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
