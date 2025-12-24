'use client';

import { Crown, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMySubscription } from '@/hooks/queries/useSubscription';

import { StatusBadge } from './StatusBadge';

export function SubscriptionStatusWidget() {
  const router = useRouter();
  const { data: subscription } = useMySubscription();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !subscription) {
    return null;
  }

  const slotsUsed = subscription.slotsUsed ?? 0;
  const slotsLimit = subscription.slotsLimit ?? 5;
  const percentage = slotsLimit > 0 ? Math.min((slotsUsed / slotsLimit) * 100, 100) : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = slotsUsed >= slotsLimit;

  return (
    <Card className="fixed bottom-4 right-4 z-40 w-80 shadow-lg border-primary/20 md:relative md:bottom-0 md:right-0 md:w-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <h3 className="font-poppins font-semibold text-sm">Subscription</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {subscription.plan ? (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {subscription.plan.displayName}
                </span>
                <StatusBadge status={subscription.status} size="sm" />
              </div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-600 dark:text-gray-400">Slots</span>
                <span className="font-semibold">
                  {slotsUsed}/{slotsLimit === null ? '∞' : slotsLimit}
                </span>
              </div>
              {slotsLimit !== null && (
                <Progress
                  value={percentage}
                  className={`h-1.5 ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-primary'}`}
                />
              )}
            </div>
            {isNearLimit && (
              <Button
                size="sm"
                className="w-full text-xs"
                onClick={() => router.push('/dashboard/account?tab=subscription')}
              >
                {isAtLimit ? 'Upgrade Now' : 'Upgrade Soon'}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {subscription.status === 'TRIALING'
                ? 'You are on a free trial'
                : 'No active subscription'}
            </p>
            <Button
              size="sm"
              className="w-full text-xs"
              onClick={() => router.push('/dashboard/account?tab=subscription')}
            >
              View Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
