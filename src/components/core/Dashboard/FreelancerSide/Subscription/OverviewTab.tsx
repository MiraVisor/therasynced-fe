'use client';

import {
  AlertTriangle,
  Calendar,
  CreditCard,
  Crown,
  ExternalLink,
  Play,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Subscription, SubscriptionPlan } from '@/types/subscription';
import {
  formatLimit,
  getBillingCycleEndDate,
  getDaysUntilBillingCycleReset,
  getGracePeriodEndDate,
  getTrialEndDate,
  isApproachingLimit,
  isInGracePeriod,
} from '@/utils/subscriptionHelpers';

import { StatusBadge } from './StatusBadge';

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
  onResume?: () => void;
  isLoading?: boolean;
  isResuming?: boolean;
}

export function OverviewTab({
  subscription,
  plan,
  onUpgrade,
  onManageBilling,
  onCancel,
  onResume,
  isLoading = false,
  isResuming = false,
}: OverviewTabProps) {
  const router = useRouter();
  const [showResumeSuccess, setShowResumeSuccess] = useState(false);
  const [gracePeriodDaysRemaining, setGracePeriodDaysRemaining] = useState<number | null>(null);

  // Calculate derived values (must be before early return)
  const hasPlan = !!plan;
  const isActive = subscription?.status === 'ACTIVE';
  const isTrial = subscription?.status === 'TRIALING';
  const isPastDue = subscription?.status === 'PAST_DUE';
  const inGracePeriod = isInGracePeriod(subscription);
  const gracePeriodEndDate = getGracePeriodEndDate(subscription);
  const isCanceledButActive =
    subscription?.cancelAtPeriodEnd === true && subscription?.status === 'ACTIVE';
  const nextBillingDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;

  // Reset success state when subscription changes
  useEffect(() => {
    if (subscription && !subscription.cancelAtPeriodEnd) {
      setShowResumeSuccess(false);
    }
  }, [subscription]);

  // Calculate days remaining in grace period
  useEffect(() => {
    if (gracePeriodEndDate) {
      const calculateDaysRemaining = () => {
        const now = new Date();
        const diff = Math.ceil(
          (gracePeriodEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        setGracePeriodDaysRemaining(diff > 0 ? diff : 0);
      };
      calculateDaysRemaining();
      const interval = setInterval(calculateDaysRemaining, 1000 * 60 * 60); // Update hourly
      return () => clearInterval(interval);
    }
    setGracePeriodDaysRemaining(null);
    return undefined;
  }, [gracePeriodEndDate]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Calculate days remaining in trial using helper function
  const trialEndDate = getTrialEndDate(subscription);
  const getTrialDaysRemaining = () => {
    if (!trialEndDate || !isTrial) return null;
    const now = new Date();
    const diff = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const trialDaysRemaining = getTrialDaysRemaining();

  // Calculate days until subscription ends (if canceled)
  const getDaysUntilEnd = () => {
    if (!isCanceledButActive || !nextBillingDate) return null;
    const now = new Date();
    const diff = Math.ceil((nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysUntilEnd = getDaysUntilEnd();

  const handleResumeClick = () => {
    if (onResume) {
      onResume();
      setShowResumeSuccess(true);
      setTimeout(() => setShowResumeSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* PAST_DUE / Grace Period Action Card */}
      {(isPastDue || inGracePeriod) && hasPlan && plan && (
        <Card className="border-red-300 bg-gradient-to-br from-red-50 to-orange-50 shadow-sm overflow-hidden animate-in slide-in-from-top duration-300">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-red-100 flex-shrink-0">
                <Shield className="h-6 w-6 text-red-600 />"
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-poppins font-semibold text-red-900 mb-1">
                  Action Required
                </h3>
                <p className="text-sm text-red-800 mb-4">
                  Your payment method needs to be updated to continue your subscription.
                </p>
                {gracePeriodDaysRemaining !== null && gracePeriodDaysRemaining > 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-red-200/50"
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-900"
                        Grace Period
                      </span>
                      <span className="text-sm font-bold text-red-900"
                        {gracePeriodDaysRemaining} {gracePeriodDaysRemaining === 1 ? 'day' : 'days'}{' '}
                        left
                      </span>
                    </div>
                    <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 transition-all duration-500"
                        style={{
                          width: `${Math.max(0, Math.min(100, (gracePeriodDaysRemaining / 7) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                {gracePeriodEndDate && (
                  <Alert className="mb-4 border-red-300 bg-red-100/50"
                    <AlertTriangle className="h-4 w-4 text-red-600 />"
                    <AlertDescription className="text-xs text-red-800"
                      If payment isn't updated by{' '}
                      {gracePeriodEndDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      , your subscription will be paused.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  {onManageBilling && (
                    <Button
                      onClick={onManageBilling}
                      size="lg"
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 font-medium shadow-sm transition-all duration-200 hover:scale-105"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Update Payment Method
                    </Button>
                  )}
                  <Button
                    onClick={() => router.push('/dashboard/account?tab=subscription')}
                    variant="outline"
                    size="lg"
                    className="border-red-300 text-red-700 hover:bg-red-50 px-6 py-2.5"
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancellation Warning Card */}
      {isCanceledButActive && (
        <Card className="border border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100/50 shadow-sm overflow-hidden animate-in slide-in-from-top duration-300">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-orange-100 flex-shrink-0">
                <Calendar className="h-5 w-5 text-orange-600 />"
              </div>
              <div className="flex-1">
                {isTrial ? (
                  <>
                    <h3 className="text-lg font-poppins font-semibold text-orange-900 mb-1">
                      Subscription Canceled - Trial Continues
                    </h3>
                    <p className="text-sm text-orange-800 mb-4">
                      Your subscription has been canceled. You'll continue with trial access until{' '}
                      {trialEndDate?.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      . No payment will be required, and you can continue using all features during
                      this time.
                    </p>
                    {trialDaysRemaining !== null && trialDaysRemaining > 0 && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-200 text-orange-900"
                          Trial ends in {trialDaysRemaining}{' '}
                          {trialDaysRemaining === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-poppins font-semibold text-orange-900 mb-1">
                      Your subscription is ending
                    </h3>
                    <p className="text-sm text-orange-800 mb-4">
                      Your subscription will end on{' '}
                      {nextBillingDate?.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      . You'll keep access until then.
                    </p>
                    {daysUntilEnd !== null && daysUntilEnd > 0 && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-200 text-orange-900"
                          Ends in {daysUntilEnd} {daysUntilEnd === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {onResume && !isTrial && (
                  <Button
                    onClick={handleResumeClick}
                    disabled={isResuming || showResumeSuccess}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 font-medium shadow-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isResuming ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Resuming...
                      </>
                    ) : showResumeSuccess ? (
                      <>
                        <span className="mr-2">✓</span>
                        Resumed!
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Resume Subscription
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero Section - Current Plan Card */}
      {hasPlan && plan && (
        <Card
          className={`border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ${
            isCanceledButActive
              ? 'border-orange-300
              : isPastDue || inGracePeriod
                ? 'border-red-300 animate-pulse'
                : ''
          }`}
        >
          <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Plan Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-lg bg-primary/10"
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-poppins font-bold text-charcoal mb-1">
                      {isTrial
                        ? `${plan.displayName} Plan (starts after trial)`
                        : `${plan.displayName} Plan`}
                    </CardTitle>
                    <StatusBadge
                      status={subscription?.status || 'INACTIVE'}
                      subscription={subscription}
                      trialEndsAt={subscription?.trialEndsAt}
                      showCountdown={isTrial}
                      size="lg"
                      className="mt-1"
                    />
                  </div>
                </div>
                <CardDescription className="text-base font-inter text-gray-700 mb-6">
                  {plan.description}
                </CardDescription>

                {/* Trial Status Message */}
                {isTrial && (
                  <Alert className="mb-6 border-orange-300 bg-orange-50"
                    <AlertTriangle className="h-4 w-4 text-orange-600 />"
                    <AlertDescription className="text-sm text-orange-800"
                      {isCanceledButActive ? (
                        <>
                          Your subscription has been canceled. You'll continue with trial access
                          until{' '}
                          {trialEndDate?.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          . No payment will be required.
                        </>
                      ) : (
                        <>
                          You're currently in your trial period. Your subscription will start after
                          the trial ends on{' '}
                          {trialEndDate?.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          . You won't be charged until then.
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Pricing - Very Prominent (only show if not in trial) */}
                {!isTrial && (
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-poppins font-bold text-charcoal">
                        EUR {plan.price.toFixed(2)}
                      </span>
                      <span className="text-lg font-inter text-gray-600"
                        /month
                      </span>
                    </div>
                  </div>
                )}

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {nextBillingDate && (
                    <div className="p-4 rounded-lg bg-white/60 border border-gray-200"
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
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
                    <div className="p-4 rounded-lg bg-white/60 border border-gray-200"
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Days Remaining
                        </p>
                      </div>
                      <p className="text-lg font-poppins font-semibold text-charcoal">
                        {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  )}
                  {subscription && (
                    <div className="p-4 rounded-lg bg-white/60 border border-gray-200"
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
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
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 font-medium shadow-sm transition-all duration-200 hover:scale-[1.02]"
                    >
                      {isTrial ? 'Upgrade Now' : 'Change Plan'}
                    </Button>
                  )}
                  {isActive && !isCanceledButActive && onManageBilling && (
                    <Button
                      onClick={onManageBilling}
                      variant="outline"
                      size="lg"
                      className="border-gray-300 hover:bg-gray-50 px-6 py-2.5 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Billing
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  {isActive && !isCanceledButActive && onCancel && (
                    <Button
                      onClick={onCancel}
                      variant="outline"
                      size="lg"
                      className="border-red-200 text-red-600 hover:bg-red-50 px-6 py-2.5 transition-all duration-200 hover:scale-[1.02]"
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
            <p className="text-sm text-gray-600"
              Monitor your subscription usage and limits
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {/* Slots Limit */}
            {isTrial ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-poppins font-semibold text-charcoal">
                    Active Slots
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Number of active slots you can create
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 used</span>"
                      <span className="text-sm font-semibold text-primary">
                        {subscription.slotsUsed ?? 0} / Unlimited
                      </span>
                    </div>
                    <div className="mt-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs text-primary font-medium">
                        During trial: Unlimited slots
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              subscription.slotsLimit !== null && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-poppins font-semibold text-charcoal">
                      Active Slots
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Number of active slots you can create
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 used</span>"
                        <span className="text-sm font-semibold">
                          {subscription.slotsUsed ?? 0}/{formatLimit(subscription.slotsLimit)}
                        </span>
                      </div>
                      {isApproachingLimit(subscription.slotsUsed ?? 0, subscription.slotsLimit) && (
                        <Alert className="mt-2 border-orange-300 bg-orange-50"
                          <AlertTriangle className="h-4 w-4 text-orange-600 />"
                          <AlertDescription className="text-xs text-orange-800"
                            You're approaching your slot limit. Consider upgrading for more slots.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            )}

            {/* Days per Week Limit */}
            {isTrial ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-poppins font-semibold text-charcoal">
                    Days per Week
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Days you can create slots for each week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600"
                        Days used this week
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {subscription.daysUsed ?? 0} / Unlimited
                      </span>
                    </div>
                    <div className="mt-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs text-primary font-medium">
                        During trial: Unlimited days per week
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              subscription.maxDaysPerWeek !== null && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-poppins font-semibold text-charcoal">
                      Days per Week
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Days you can create slots for each week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600"
                          Days used this week
                        </span>
                        <span className="text-sm font-semibold">
                          {subscription.daysUsed ?? 0}/{formatLimit(subscription.maxDaysPerWeek)}
                        </span>
                      </div>
                      {isApproachingLimit(
                        subscription.daysUsed ?? 0,
                        subscription.maxDaysPerWeek,
                      ) && (
                        <Alert className="mt-2 border-orange-300 bg-orange-50"
                          <AlertTriangle className="h-4 w-4 text-orange-600 />"
                          <AlertDescription className="text-xs text-orange-800"
                            You're approaching your weekly day limit. Consider upgrading for more
                            flexibility.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            )}

            {/* Messages per Billing Cycle Limit */}
            {isTrial ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-poppins font-semibold text-charcoal">
                    Messages per Billing Cycle
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Messages you can send each billing cycle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600"
                        Messages used
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {subscription.messagesUsed ?? 0} / Unlimited
                      </span>
                    </div>
                    <div className="mt-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs text-primary font-medium">
                        During trial: Unlimited messages
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              subscription.maxMessagesPerBillingCycle !== null && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-poppins font-semibold text-charcoal">
                      Messages per Billing Cycle
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Messages you can send each billing cycle
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600"
                          Messages used
                        </span>
                        <span className="text-sm font-semibold">
                          {subscription.messagesUsed ?? 0}/
                          {formatLimit(subscription.maxMessagesPerBillingCycle)}
                        </span>
                      </div>
                      {(() => {
                        const billingCycleEnd = getBillingCycleEndDate(subscription);
                        const daysUntilReset = getDaysUntilBillingCycleReset(subscription);
                        return (
                          <div className="text-xs text-gray-500"
                            {billingCycleEnd && daysUntilReset !== null ? (
                              <span>
                                Billing cycle resets in {daysUntilReset}{' '}
                                {daysUntilReset === 1 ? 'day' : 'days'} (
                                {billingCycleEnd.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                                )
                              </span>
                            ) : (
                              <span>Billing cycle information unavailable</span>
                            )}
                          </div>
                        );
                      })()}
                      {isApproachingLimit(
                        subscription.messagesUsed ?? 0,
                        subscription.maxMessagesPerBillingCycle,
                      ) && (
                        <Alert className="mt-2 border-orange-300 bg-orange-50"
                          <AlertTriangle className="h-4 w-4 text-orange-600 />"
                          <AlertDescription className="text-xs text-orange-800"
                            You're approaching your messaging limit. Consider upgrading for
                            unlimited messages.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      )}

      {/* No Plan State / Inactive State - Improved Empty State */}
      {(!hasPlan || subscription?.status === 'UNPAID' || subscription?.status === 'INACTIVE') && (
        <Card className="border-2 border-dashed border-gray-300 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="p-4 rounded-full bg-gray-100 mb-6">
              <Crown className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-poppins font-bold text-charcoal mb-3">
              {subscription?.status === 'UNPAID' || subscription?.status === 'INACTIVE'
                ? 'Your subscription is paused'
                : 'No Active Plan'}
            </h3>
            <p className="text-base text-gray-600 text-center mb-8 max-w-md">
              {subscription?.status === 'TRIAL_EXPIRED' || subscription?.status === 'INACTIVE'
                ? 'Your trial has expired. Subscribe to a plan to continue using the platform and unlock all features.'
                : subscription?.status === 'UNPAID'
                  ? 'Your subscription has been paused due to payment issues. Reactivate your subscription to continue using all features.'
                  : 'Choose a subscription plan to unlock all features and start accepting bookings.'}
            </p>
            {subscription?.status === 'UNPAID' && (
              <div className="mb-4 text-sm text-gray-600"
                <p className="font-medium mb-2">You'll get back:</p>
                <ul className="list-disc list-inside space-y-1">
                  {plan && (
                    <>
                      <li>Access to {plan.displayName} plan features</li>
                      <li>Ability to create slots and accept bookings</li>
                      <li>All premium features</li>
                    </>
                  )}
                </ul>
              </div>
            )}
            <Button
              onClick={() => router.push('/dashboard/account?tab=subscription&view=plans')}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 font-medium shadow-sm transition-all duration-200 hover:scale-105"
            >
              {subscription?.status === 'UNPAID' || subscription?.status === 'INACTIVE'
                ? 'Reactivate Subscription'
                : 'View Available Plans'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
