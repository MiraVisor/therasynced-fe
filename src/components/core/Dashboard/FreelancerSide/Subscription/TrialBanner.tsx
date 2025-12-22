'use client';

import { AlertCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useMySubscription } from '@/hooks/queries/useSubscription';
import { getDecodedToken } from '@/lib/utils';

export default function TrialBanner() {
  const router = useRouter();
  const { data: subscription } = useMySubscription();
  const decodedToken = getDecodedToken();
  const subscriptionStatus = decodedToken?.subscriptionStatus || subscription?.status;
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  // Move useEffect BEFORE the early return
  useEffect(() => {
    const trialEndsAt = subscription?.trialEndsAt;

    const calculateDaysRemaining = () => {
      if (!trialEndsAt) {
        setDaysRemaining(null);
        return;
      }
      const endDate = new Date(trialEndsAt);
      const now = new Date();
      const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setDaysRemaining(diff > 0 ? diff : 0);
    };

    calculateDaysRemaining();

    if (!trialEndsAt) {
      return;
    }

    const interval = setInterval(calculateDaysRemaining, 1000 * 60 * 60); // Update hourly

    return () => clearInterval(interval);
  }, [subscription?.trialEndsAt]);

  // Always show banner if status is TRIALING
  if (subscriptionStatus !== 'TRIALING') {
    return null;
  }

  const slotsUsed = subscription?.slotsUsed ?? 0;
  const slotsLimit = subscription?.slotsLimit ?? 5;

  return (
    <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <AlertTitle className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              Free Trial Active
              {daysRemaining !== null && (
                <span className="flex items-center gap-1 text-sm font-normal text-orange-700 dark:text-orange-300">
                  <Clock className="h-4 w-4" />
                  {daysRemaining === 0
                    ? 'Expires today'
                    : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`}
                </span>
              )}
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-2 text-gray-700 dark:text-gray-300">
              <p>
                Your free trial is active. Explore all features and subscribe when you&apos;re
                ready!
              </p>
              {subscription && (
                <div className="text-sm">
                  <p>
                    <strong>Slots:</strong> {slotsUsed}/{slotsLimit} active slots
                    {slotsUsed >= slotsLimit && (
                      <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
                        (Limit reached)
                      </span>
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
            className="bg-primary hover:bg-primary/90 whitespace-nowrap"
          >
            Choose Plan
          </Button>
        </div>
      </div>
    </Alert>
  );
}
