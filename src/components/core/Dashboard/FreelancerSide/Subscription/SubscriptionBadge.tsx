'use client';

import { Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getMySubscription } from '@/redux/api/subscriptionApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks/useAppHooks';

export default function SubscriptionBadge() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentSubscription, isLoading } = useAppSelector((state) => state.subscription);

  useEffect(() => {
    // Load subscription on mount
    if (!currentSubscription) {
      dispatch(getMySubscription());
    }
  }, [dispatch, currentSubscription]);

  if (isLoading || !currentSubscription) {
    return null;
  }

  // Don't show badge if no plan (user is in trial or inactive)
  if (!currentSubscription.plan) {
    return null;
  }

  const handleClick = () => {
    router.push('/dashboard/account?tab=subscription');
  };

  const getStatusColor = () => {
    switch (currentSubscription.status) {
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
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {currentSubscription.plan.displayName}
          </div>
          <Badge className={`mt-1 text-xs ${getStatusColor()}`}>{currentSubscription.status}</Badge>
        </div>
      </div>
    </Card>
  );
}
