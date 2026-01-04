'use client';

import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useMySubscription } from '@/hooks/queries/useSubscription';
import { getDecodedToken } from '@/lib/utils';
import { getTrialEndDate, isInTrial } from '@/utils/subscriptionHelpers';

export default function TrialBanner() {
  const router = useRouter();
  const { data: subscription } = useMySubscription();
  const decodedToken = getDecodedToken();
  const subscriptionStatus = decodedToken?.subscriptionStatus ?? subscription?.status;
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  // Calculate days remaining using helper function
  useEffect(() => {
    const trialEndDate = getTrialEndDate(subscription ?? null);

    const calculateDaysRemaining = () => {
      if (!trialEndDate) {
        setDaysRemaining(null);
        return;
      }
      const now = new Date();
      const diff = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setDaysRemaining(diff > 0 ? diff : 0);
    };

    calculateDaysRemaining();

    if (!trialEndDate) {
      return;
    }

    const interval = setInterval(calculateDaysRemaining, 1000 * 60 * 60); // Update hourly

    return () => clearInterval(interval);
  }, [subscription]);

  // Show banner if user is in trial (either standalone or Stripe subscription trial)
  const inTrial = isInTrial(subscription ?? null) || subscriptionStatus === 'TRIALING';
  if (!inTrial) {
    return null;
  }

  const slotsUsed = subscription?.slotsUsed ?? 0;
  const slotsLimit = subscription?.slotsLimit ?? null; // null = unlimited for trials
  const isUnlimited = slotsLimit === null;
  const isCanceledDuringTrial =
    subscription?.status === 'TRIALING' && subscription?.cancelAtPeriodEnd === true;
  const trialEndDate = getTrialEndDate(subscription ?? null);

  // Determine color based on days remaining
  const getColorClass = () => {
    if (daysRemaining === null)
      return 'border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20';
    if (daysRemaining > 7)
      return 'border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20';
    if (daysRemaining > 3)
      return 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20';
    return 'border-orange-600 bg-gradient-to-r from-orange-100 to-red-50 dark:from-orange-900/30 dark:to-red-900/20';
  };

  return (
    <Alert className={`${getColorClass()} shadow-sm animate-in slide-in-from-top duration-300`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex-shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <AlertTitle className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              Free Trial Active
              {daysRemaining !== null && (
                <span className="flex items-center gap-1 text-sm font-normal text-orange-700 dark:text-orange-300">
                  {daysRemaining === 0
                    ? 'Expires today'
                    : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`}
                </span>
              )}
            </AlertTitle>
            {/* Progress bar */}
            {daysRemaining !== null && daysRemaining <= 14 && (
              <div className="mb-3">
                <div className="h-1.5 bg-orange-200 dark:bg-orange-900/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 dark:bg-orange-400 transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(0, Math.min(100, (daysRemaining / 14) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}
            <AlertDescription className="mt-2 space-y-2 text-gray-700 dark:text-gray-300">
              {isCanceledDuringTrial ? (
                <p>
                  Your subscription has been canceled. You&apos;ll continue with trial access until{' '}
                  {trialEndDate?.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  . No payment will be required.
                </p>
              ) : subscription?.status === 'TRIALING' && subscription?.plan ? (
                <p>
                  You&apos;re currently in your trial period. Your{' '}
                  <strong>{subscription.plan.displayName}</strong> subscription will begin on{' '}
                  {trialEndDate?.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  , and you&apos;ll be charged starting then.
                </p>
              ) : subscription?.status === 'TRIALING' ? (
                <p>
                  You&apos;re currently in your trial period. Your subscription will start after the
                  trial ends on{' '}
                  {trialEndDate?.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  . You won&apos;t be charged until then.
                </p>
              ) : (
                <p>Your 14-day free trial is active. Full platform access, no restrictions!</p>
              )}
              {subscription && (
                <div className="text-sm">
                  <p>
                    <strong>Slots:</strong>{' '}
                    {isUnlimited ? (
                      <span>
                        {slotsUsed} active slots{' '}
                        <span className="text-primary font-medium">(Unlimited)</span>
                      </span>
                    ) : (
                      <>
                        {slotsUsed}/{slotsLimit} active slots
                        {slotsUsed >= slotsLimit && (
                          <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
                            (Limit reached)
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>
              )}
            </AlertDescription>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={() => router.push('/dashboard/account?tab=subscription')}
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90 whitespace-nowrap transition-all duration-200 hover:scale-105"
          >
            Choose Plan
          </Button>
        </div>
      </div>
    </Alert>
  );
}
