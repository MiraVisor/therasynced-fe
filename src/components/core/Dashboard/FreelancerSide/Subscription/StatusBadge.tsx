'use client';

import { AlertCircle, Clock, Crown, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Subscription, SubscriptionStatus } from '@/types/subscription';
import { getTrialEndDate } from '@/utils/subscriptionHelpers';

interface StatusBadgeProps {
  status: SubscriptionStatus;
  trialEndsAt?: string | null;
  subscription?: Subscription | null; // Pass full subscription to use helper
  className?: string;
  showCountdown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({
  status,
  trialEndsAt,
  subscription,
  className = '',
  showCountdown = false,
  size = 'md',
}: StatusBadgeProps) {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (showCountdown && status === 'TRIALING') {
      // Use helper function to get correct trial end date
      const trialEndDate = subscription
        ? getTrialEndDate(subscription)
        : trialEndsAt
          ? new Date(trialEndsAt)
          : null;

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
      const interval = setInterval(calculateDaysRemaining, 1000 * 60 * 60); // Update hourly

      return () => clearInterval(interval);
    }
    return undefined; // Explicit return for else case
  }, [trialEndsAt, status, showCountdown, subscription]);

  const getStatusConfig = () => {
    switch (status) {
      case 'ACTIVE':
        return {
          color:
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700',
          icon: Crown,
          label: 'Active',
        };
      case 'TRIALING':
        // Check if subscription is canceled during trial
        const isCanceledDuringTrial = subscription?.cancelAtPeriodEnd === true;
        return {
          color:
            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-700',
          icon: Clock,
          label: isCanceledDuringTrial
            ? 'Trial Active - Subscription Canceled'
            : 'Trial Active - Subscription Starts After Trial',
        };
      case 'TRIAL_EXPIRED':
        return {
          color:
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700',
          icon: XCircle,
          label: 'Trial Expired',
        };
      case 'PAST_DUE':
        return {
          color:
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700 animate-pulse',
          icon: AlertCircle,
          label: 'Past Due',
        };
      case 'INACTIVE':
        return {
          color:
            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700',
          icon: XCircle,
          label: 'Inactive',
        };
      case 'CANCELED':
        return {
          color:
            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700',
          icon: XCircle,
          label: 'Canceled',
        };
      case 'UNPAID':
        return {
          color:
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700',
          icon: AlertCircle,
          label: 'Unpaid',
        };
      default:
        return {
          color:
            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700',
          icon: Clock,
          label: status,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <Badge
      variant="outline"
      className={`${config.color} ${sizeClasses[size]} ${className} inline-flex items-center gap-1.5 border`}
    >
      <Icon
        className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4'}`}
      />
      <span>{config.label}</span>
      {showCountdown && daysRemaining !== null && status === 'TRIALING' && (
        <span className="ml-1 font-medium">
          {daysRemaining === 0
            ? 'Expires today'
            : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`}
        </span>
      )}
    </Badge>
  );
}
