'use client';

import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Crown,
  ExternalLink,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Subscription, SubscriptionPlan } from '@/types/subscription';

import { StatusBadge } from './StatusBadge';
import { UsageMeter } from './UsageMeter';

/**
 * OverviewTab Component
 *
 * This component displays subscription overview information.
 * NOTE: This component does NOT make any API calls - all data is passed as props
 * from the parent SubscriptionManagement component, which handles all data fetching
 * via useMySubscription and useSubscriptionPlans hooks.
 */
interface OverviewTabProps {
  subscription: Subscription | null;
  plan: SubscriptionPlan | undefined;
  onUpgrade?: () => void;
  onManageBilling?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function OverviewTab({
  subscription,
  plan,
  onUpgrade,
  onManageBilling,
  onCancel,
  isLoading = false,
}: OverviewTabProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const hasPlan = !!plan;
  const isActive = subscription?.status === 'ACTIVE';
  const isTrial = subscription?.status === 'TRIALING';
  const nextBillingDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;

  // Calculate days remaining in trial
  const getTrialDaysRemaining = () => {
    if (!subscription?.trialEndsAt || !isTrial) return null;
    const endDate = new Date(subscription.trialEndsAt);
    const now = new Date();
    const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const trialDaysRemaining = getTrialDaysRemaining();

  return (
    <div className="space-y-8">
      {/* Hero Section - Current Plan Card */}
      {hasPlan && plan && (
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent dark:from-primary/10 dark:via-primary/5 p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Plan Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-lg bg-primary/10 dark:bg-primary/20">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-poppins font-bold text-charcoal mb-1">
                      {plan.displayName} Plan
                    </CardTitle>
                    <StatusBadge
                      status={subscription?.status || 'INACTIVE'}
                      trialEndsAt={subscription?.trialEndsAt}
                      showCountdown={isTrial}
                      size="lg"
                      className="mt-1"
                    />
                  </div>
                </div>
                <CardDescription className="text-base font-inter text-gray-700 dark:text-gray-300 mb-6">
                  {plan.description}
                </CardDescription>

                {/* Pricing - Very Prominent */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-poppins font-bold text-charcoal">
                      EUR {plan.price.toFixed(2)}
                    </span>
                    <span className="text-lg font-inter text-gray-600 dark:text-gray-400">
                      /month
                    </span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {nextBillingDate && (
                    <div className="p-4 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          {isTrial ? 'Trial Ends' : 'Next Billing'}
                        </p>
                      </div>
                      <p className="text-lg font-poppins font-semibold text-charcoal">
                        {nextBillingDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  {isTrial && trialDaysRemaining !== null && (
                    <div className="p-4 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          Days Remaining
                        </p>
                      </div>
                      <p className="text-lg font-poppins font-semibold text-charcoal">
                        {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  )}
                  {subscription && (
                    <div className="p-4 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          Status
                        </p>
                      </div>
                      <p className="text-lg font-poppins font-semibold text-charcoal capitalize">
                        {subscription.status === 'ACTIVE'
                          ? 'Active'
                          : subscription.status === 'TRIALING'
                            ? 'Trial'
                            : subscription.status}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Actions - Primary Buttons */}
                <div className="flex flex-wrap gap-3">
                  {onUpgrade && (
                    <Button
                      onClick={onUpgrade}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 font-medium shadow-sm"
                    >
                      {isTrial ? 'Upgrade Now' : 'Change Plan'}
                    </Button>
                  )}
                  {isActive && onManageBilling && (
                    <Button
                      onClick={onManageBilling}
                      variant="outline"
                      size="lg"
                      className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-2.5"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Billing
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  {isActive && onCancel && (
                    <Button
                      onClick={onCancel}
                      variant="outline"
                      size="lg"
                      className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-6 py-2.5"
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Usage Metrics - Cleaner Design */}
      {subscription && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-poppins font-bold text-charcoal mb-1">Usage & Limits</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor your subscription usage and limits
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slot Usage Card */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
                  Slot Usage
                </CardTitle>
                <CardDescription className="text-sm">
                  Track your active slots and limits
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <UsageMeter
                  slotsUsed={subscription.slotsUsed}
                  slotsLimit={subscription.slotsLimit}
                  canCreateSlots={subscription.canCreateSlots}
                  showWarning={true}
                />
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
                  Account Status
                </CardTitle>
                <CardDescription className="text-sm">
                  Your subscription capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-md ${subscription.canCreateSlots ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
                    >
                      {subscription.canCreateSlots ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Can Create Slots
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      subscription.canCreateSlots
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {subscription.canCreateSlots ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-md ${subscription.canAcceptBookings ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
                    >
                      {subscription.canAcceptBookings ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Can Accept Bookings
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      subscription.canAcceptBookings
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {subscription.canAcceptBookings ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* No Plan State - Improved Empty State */}
      {!hasPlan && (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
              <Crown className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-poppins font-bold text-charcoal mb-3">No Active Plan</h3>
            <p className="text-base text-gray-600 dark:text-gray-400 text-center mb-8 max-w-md">
              {subscription?.status === 'TRIAL_EXPIRED' || subscription?.status === 'INACTIVE'
                ? 'Your trial has expired. Subscribe to a plan to continue using the platform and unlock all features.'
                : 'Choose a subscription plan to unlock all features and start accepting bookings.'}
            </p>
            <Button
              onClick={() => router.push('/dashboard/account?tab=subscription&view=plans')}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 font-medium shadow-sm"
            >
              View Available Plans
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
