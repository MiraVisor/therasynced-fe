'use client';

import { Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getDecodedToken } from '@/lib/utils';
import { useAppSelector } from '@/redux/hooks/useAppHooks';

export default function SubscriptionBadge() {
  const router = useRouter();
  const { plans } = useAppSelector((state) => state.subscription);
  const decodedToken = getDecodedToken();
  const subscriptionStatus = decodedToken?.subscriptionStatus;

  // Only show badge for ACTIVE subscriptions (not TRIALING, PAST_DUE, CANCELED, UNPAID)
  if (!subscriptionStatus || subscriptionStatus !== 'ACTIVE') {
    return null;
  }

  // Try to find the current plan from plans (if available)
  const currentPlan = plans.find((plan) => plan.name === 'SILVER') || plans[0];

  const handleClick = () => {
    router.push('/dashboard/account?tab=subscription');
  };

  const getStatusColor = () => {
    switch (subscriptionStatus) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'TRIALING':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'PAST_DUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card
      className="cursor-pointer border-2 border-primary/20 hover:border-primary/40 transition-all duration-200"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 p-3">
        <Crown className="h-5 w-5 text-primary" />
        <div className="flex-1">
          {currentPlan && (
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {currentPlan.displayName}
            </div>
          )}
          <Badge className={`mt-1 text-xs ${getStatusColor()}`}>{subscriptionStatus}</Badge>
        </div>
      </div>
    </Card>
  );
}
