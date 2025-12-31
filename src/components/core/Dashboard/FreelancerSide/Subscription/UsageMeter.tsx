'use client';

import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface UsageMeterProps {
  slotsUsed: number;
  slotsLimit: number | null; // null = unlimited
  canCreateSlots: boolean;
  className?: string;
  showWarning?: boolean;
  warningThreshold?: number; // Percentage at which to show warning (default 80%)
}

export function UsageMeter({
  slotsUsed,
  slotsLimit,
  canCreateSlots,
  className = '',
  showWarning = true,
  warningThreshold = 80,
}: UsageMeterProps) {
  // Only consider unlimited if slotsLimit is null AND user can create slots
  // This prevents showing "unlimited" when trial expired (slotsLimit: null but canCreateSlots: false)
  const isUnlimited = slotsLimit === null && canCreateSlots;
  const percentage = isUnlimited
    ? 0
    : slotsLimit !== null && slotsLimit > 0
      ? Math.min((slotsUsed / slotsLimit) * 100, 100)
      : 0;
  const isNearLimit = !isUnlimited && slotsLimit !== null && percentage >= warningThreshold;
  const isAtLimit = !isUnlimited && slotsLimit !== null && slotsUsed >= slotsLimit;

  const getProgressColor = () => {
    if (isUnlimited) return 'bg-primary';
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-orange-500';
    return 'bg-primary';
  };

  const getStatusIcon = () => {
    if (isAtLimit || !canCreateSlots) {
      return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    }
    if (isNearLimit) {
      return <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    }
    return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {getStatusIcon()}
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Slot Usage</span>
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isUnlimited ? (
            <span className="font-semibold text-primary">{slotsUsed} slots active</span>
          ) : slotsLimit !== null ? (
            <span>
              <span className="font-bold text-charcoal">{slotsUsed}</span> /{' '}
              <span className="text-gray-600 dark:text-gray-400">{slotsLimit}</span> slots
            </span>
          ) : (
            <span className="font-semibold text-gray-600 dark:text-gray-400">
              {slotsUsed} slots active
            </span>
          )}
        </div>
      </div>

      {!isUnlimited && slotsLimit !== null && (
        <Progress value={percentage} className="h-3 bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </Progress>
      )}

      {isUnlimited && (
        <div className="rounded-lg bg-primary/10 p-3">
          <p className="text-sm font-medium text-primary">Unlimited slots available</p>
        </div>
      )}

      {showWarning && isAtLimit && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You've reached your slot limit.{' '}
            {canCreateSlots ? 'Upgrade your plan' : 'Subscribe to a plan'} to create more slots.
          </AlertDescription>
        </Alert>
      )}

      {showWarning && isNearLimit && !isAtLimit && (
        <Alert className="mt-2 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            You're using {Math.round(percentage)}% of your available slots. Consider upgrading to
            avoid hitting the limit.
          </AlertDescription>
        </Alert>
      )}

      {!canCreateSlots && !isAtLimit && (
        <Alert variant="destructive" className="mt-2">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            You cannot create new slots. Please subscribe to a plan to continue using the platform.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
