'use client';

import { Crown, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMySubscription } from '@/hooks/queries/useSubscription';
import { formatLimit, isApproachingLimit } from '@/utils/subscriptionHelpers';

import { StatusBadge } from './StatusBadge';

export function SubscriptionStatusWidget() {
  const router = useRouter();
  const { data: subscription } = useMySubscription();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !subscription) {
    return null;
  }

  const isTrial = subscription.status === 'TRIALING' || subscription.isInTrial === true;
  const slotsUsed = subscription.slotsUsed ?? 0;
  const slotsLimit = subscription.slotsLimit ?? null; // null = unlimited
  const daysUsed = subscription.daysUsed ?? 0;
  const daysLimit = subscription.maxDaysPerWeek ?? null;
  const messagesUsed = subscription.messagesUsed ?? 0;
  const messagesLimit = subscription.maxMessagesPerBillingCycle ?? null;

  // During trial, all limits are unlimited (null)
  const isUnlimitedSlots = isTrial || slotsLimit === null;
  const isUnlimitedDays = isTrial || daysLimit === null;
  const isUnlimitedMessages = isTrial || messagesLimit === null;
  const slotsPercentage =
    !isUnlimitedSlots && slotsLimit !== null && slotsLimit > 0
      ? Math.min((slotsUsed / slotsLimit) * 100, 100)
      : 0;
  const isNearSlotsLimit = isApproachingLimit(slotsUsed, slotsLimit);
  const isAtSlotsLimit = !isUnlimitedSlots && slotsLimit !== null && slotsUsed >= slotsLimit;

  const daysPercentage =
    !isUnlimitedDays && daysLimit !== null && daysLimit > 0
      ? Math.min((daysUsed / daysLimit) * 100, 100)
      : 0;
  const isNearDaysLimit = isApproachingLimit(daysUsed, daysLimit);
  const messagesPercentage =
    !isUnlimitedMessages && messagesLimit !== null && messagesLimit > 0
      ? Math.min((messagesUsed / messagesLimit) * 100, 100)
      : 0;
  const isNearMessagesLimit = isApproachingLimit(messagesUsed, messagesLimit);
  const isAtMessagesLimit =
    !isUnlimitedMessages && messagesLimit !== null && messagesUsed >= messagesLimit;

  const isNearAnyLimit = isNearSlotsLimit || isNearDaysLimit || isNearMessagesLimit;
  const isAtAnyLimit = isAtSlotsLimit || isAtMessagesLimit;

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
                <span className="text-xs font-medium text-gray-600">
                  {subscription.plan.displayName}
                </span>
                <StatusBadge status={subscription.status} size="sm" />
              </div>

              {/* Slots Limit */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">
                  <span className="font-semibold">
                    {isTrial ? (
                      <span className="text-primary">{slotsUsed} / Unlimited</span>
                    ) : (
                      `${slotsUsed}/${formatLimit(slotsLimit)}`
                    )}
                  </span>
                </div>
                {!isTrial && slotsLimit !== null && (
                  <Progress
                    value={slotsPercentage}
                    className={`h-1.5 ${
                      isAtSlotsLimit
                        ? 'bg-red-500'
                        : isNearSlotsLimit
                          ? 'bg-orange-500'
                          : 'bg-primary'
                    }`}
                  />
                )}
              </div>

              {/* Days Limit */}
              {isTrial ? (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 per week</span>">
                    <span className="font-semibold text-primary">{daysUsed} / Unlimited</span>
                  </div>
                </div>
              ) : (
                daysLimit !== null && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600 per week</span>">
                      <span className="font-semibold">
                        {daysUsed}/{formatLimit(daysLimit)}
                      </span>
                    </div>
                    <Progress
                      value={daysPercentage}
                      className={`h-1.5 ${isNearDaysLimit ? 'bg-orange-500' : 'bg-primary'}`}
                    />
                  </div>
                )
              )}

              {/* Messages Limit */}
              {isTrial ? (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">
                    <span className="font-semibold text-primary">{messagesUsed} / Unlimited</span>
                  </div>
                </div>
              ) : (
                messagesLimit !== null && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">
                      <span className="font-semibold">
                        {messagesUsed}/{formatLimit(messagesLimit)}
                      </span>
                    </div>
                    <Progress
                      value={messagesPercentage}
                      className={`h-1.5 ${
                        isAtMessagesLimit
                          ? 'bg-red-500'
                          : isNearMessagesLimit
                            ? 'bg-orange-500'
                            : 'bg-primary'
                      }`}
                    />
                  </div>
                )
              )}
            </div>
            {isNearAnyLimit && (
              <Button
                size="sm"
                className="w-full text-xs"
                onClick={() => router.push('/dashboard/account?tab=subscription')}
              >
                {isAtAnyLimit ? 'Upgrade Now' : 'Upgrade Soon'}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-600">
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
