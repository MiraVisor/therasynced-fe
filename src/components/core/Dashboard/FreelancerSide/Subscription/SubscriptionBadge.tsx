'use client';

import { Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Card } from '@/components/ui/card';
import { useMySubscription, useSubscriptionPlans } from '@/hooks/queries/useSubscription';
import { getDecodedToken } from '@/lib/utils';

import { StatusBadge } from './StatusBadge';

export default function SubscriptionBadge() {
  const router = useRouter();
  const { data: plans = [] } = useSubscriptionPlans();
  const { data: subscription } = useMySubscription();
  const decodedToken = getDecodedToken();
  const subscriptionStatus = decodedToken?.subscriptionStatus || subscription?.status;

  // Only show badge for ACTIVE subscriptions (not TRIALING, PAST_DUE, CANCELED, UNPAID)
  if (!subscriptionStatus || subscriptionStatus !== 'ACTIVE') {
    return null;
  }

  // Get current plan from subscription data or plans list
  const currentPlan =
    subscription?.plan || plans.find((plan) => plan.name === 'SILVER') || plans[0];

  const handleClick = () => {
    router.push('/dashboard/account?tab=subscription');
  };

  return (
    <Card
      className="cursor-pointer border-2 border-primary/20 transition-all hover:border-primary/40 hover:shadow-md"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 p-3">
        <Crown className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {currentPlan && (
            <div className="text-sm font-poppins font-semibold text-gray-900 truncate">
              {currentPlan.displayName}
            </div>
          )}
          <div className="mt-1">
            <StatusBadge status={subscriptionStatus} size="sm" />
          </div>
        </div>
      </div>
    </Card>
  );
}
