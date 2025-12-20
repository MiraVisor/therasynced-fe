'use client';

import { AlertTriangle, CreditCard, Crown, ExternalLink, Info } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// Note: Skeleton import is correct - it's defined in src/components/ui/skeleton.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useBillingPortal,
  useCancelSubscription,
  useCreateCheckoutSession,
  useMySubscription,
  useResumeSubscription,
  useSubscriptionPlans,
  useUpdateSubscription,
} from '@/hooks/queries/useSubscription';
import { getDecodedToken } from '@/lib/utils';
import { PlanType } from '@/types/types';

import { EmbeddedCheckout } from './EmbeddedCheckout';
import { PlanCard } from './PlanCard';

export default function SubscriptionManagement() {
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Use React Query hooks
  const { data: plans = [], isFetching: initialLoading } = useSubscriptionPlans();
  const { data: currentSubscription, isFetching: isLoading } = useMySubscription();
  const { mutate: createCheckout, isPending: isSubscribing } = useCreateCheckoutSession();
  const { mutate: updateSubscriptionMutation, isPending: isUpdating } = useUpdateSubscription();
  const { mutate: cancelSubscriptionMutation, isPending: isCanceling } = useCancelSubscription();
  const { mutate: resumeSubscriptionMutation } = useResumeSubscription();

  // For billing portal, we need to use query with enabled: false and refetch
  const { refetch: refetchBillingPortal, isFetching: isLoadingPortal } = useBillingPortal();

  // Combine loading states - only show loader if no data exists
  const isLoadingPlans =
    initialLoading || (isLoading && plans.length === 0 && !currentSubscription) || isSubscribing;

  const decodedToken = getDecodedToken();
  const subscriptionStatus = decodedToken?.subscriptionStatus;

  const handleSelectPlan = async (planType: PlanType) => {
    try {
      // Decision logic based on guide:
      // 1. Has active subscription (ACTIVE/TRIALING) → Use update endpoint
      // 2. Has canceled subscription (cancelAtPeriodEnd: true) → Use update endpoint (removes cancellation)
      // 3. No subscription → Use checkout endpoint

      // Check subscription status - prioritize Redux state (most up-to-date) over token
      const statusFromState = currentSubscription?.status;

      // Check if subscription exists
      const hasSubscription = !!currentSubscription;

      // Check if user has a paid plan (not just a trial record)
      // Trial users who never subscribed won't have a plan property
      const hasPlan = currentSubscription?.plan !== undefined;

      // Determine if subscription is active
      // Active means: ACTIVE/TRIALING status OR canceled but still active until period end
      const isCanceledButActive = currentSubscription?.cancelAtPeriodEnd === true;

      // Decision: Use update endpoint if we have a subscription that appears active
      // IMPORTANT: Trial users without a plan (never subscribed) should use checkout, not update
      // We check statusFromState directly to avoid token staleness issues
      // For ACTIVE status: always use update (they have a paid subscription)
      // For TRIALING status: only use update if they have a plan (had subscription before)
      // For canceled subscriptions: use update if they have a plan
      const shouldUseUpdate =
        hasSubscription &&
        hasPlan &&
        (statusFromState === 'ACTIVE' || statusFromState === 'TRIALING' || isCanceledButActive);

      if (shouldUseUpdate) {
        updateSubscriptionMutation(
          { planType },
          {
            onSuccess: () => {
              // React Query will automatically refetch subscription
            },
            onError: (error: unknown) => {
              const errorMessage =
                error?.response?.data?.message || 'Failed to update subscription';
              // If update fails with "No active subscription", try checkout instead
              if (
                errorMessage.includes('No active subscription') ||
                errorMessage.includes('not found') ||
                errorMessage.includes('does not exist')
              ) {
                toast.info('Creating new subscription...');
                // Fall through to checkout flow
                handleCheckout(planType);
              } else {
                toast.error(errorMessage);
              }
            },
          },
        );
        return;
      }

      // No active subscription - use checkout endpoint
      handleCheckout(planType);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process subscription';
      toast.error(errorMessage);
    }
  };

  const handleCheckout = (planType: PlanType) => {
    createCheckout(planType, {
      onSuccess: (checkoutData: unknown) => {
        // Open embedded checkout with client secret
        const data =
          checkoutData && typeof checkoutData === 'object' && 'data' in checkoutData
            ? (checkoutData as { data: { clientSecret?: string; sessionUrl?: string } }).data
            : (checkoutData as { clientSecret?: string; sessionUrl?: string });
        if (data?.clientSecret) {
          setCheckoutClientSecret(data.clientSecret);
          setIsCheckoutOpen(true);
        } else if (data?.sessionUrl) {
          // Fallback to redirect if no client secret
          window.location.href = data.sessionUrl;
        }
      },
      onError: (error: unknown) => {
        const errorMessage =
          error && typeof error === 'object' && 'response' in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
              ''
            : '';
        // If checkout fails with "already have an active subscription" error, try update instead
        if (
          errorMessage.includes('already have an active subscription') ||
          errorMessage.includes('already subscribed')
        ) {
          toast.info('Updating existing subscription...');
          updateSubscriptionMutation({ planType });
        } else {
          toast.error('Failed to create checkout session');
        }
      },
    });
  };

  const handleCancel = () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    cancelSubscriptionMutation(
      {},
      {
        onSuccess: () => {
          toast.success('Subscription will be cancelled at the end of the current period.');
          // React Query will automatically refetch
        },
      },
    );
  };

  const handleResume = () => {
    resumeSubscriptionMutation(undefined, {
      onSuccess: () => {
        // React Query will automatically refetch
      },
    });
  };

  const handleOpenBillingPortal = async () => {
    try {
      const result = await refetchBillingPortal();
      if (result.data) {
        // Open billing portal in new tab
        window.open(result.data, '_blank', 'noopener,noreferrer');
      }
    } catch (err: unknown) {
      toast.error('Failed to open billing portal');
    }
  };

  const getDaysInTrial = () => {
    const endDate = currentSubscription?.trialEnd || currentSubscription?.trialEndsAt;
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Use token status if available, otherwise fall back to currentSubscription
  const status = subscriptionStatus || currentSubscription?.status;
  const isTrial = status === 'TRIALING';
  const isInactive = status === 'INACTIVE' || status === 'UNPAID';
  const isCancelled = currentSubscription?.cancelAtPeriodEnd;
  const hasPlan = currentSubscription?.plan !== undefined;
  const userHasActiveSubscription = status === 'ACTIVE' && !!currentSubscription?.plan;

  if (isLoadingPlans) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        {isSubscribing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rounded-lg bg-white p-6 dark:bg-gray-800">
              <p className="text-center">Redirecting to Stripe Checkout...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-charcoal">Subscription</h1>
        <p className="text-sm font-inter text-gray-600 dark:text-gray-400">
          Manage your subscription plan
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-poppins font-bold text-charcoal">
                {hasPlan ? 'Current Plan' : 'Subscription Status'}
              </CardTitle>
              <Badge
                variant={
                  status === 'ACTIVE'
                    ? 'default'
                    : status === 'TRIALING'
                      ? 'secondary'
                      : status === 'INACTIVE' || status === 'UNPAID'
                        ? 'destructive'
                        : 'destructive'
                }
              >
                {status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Show plan info only if user has a plan */}
            {hasPlan && currentSubscription.plan && (
              <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                <div>
                  <h3 className="font-poppins font-semibold text-primary">
                    {currentSubscription.plan.displayName}
                  </h3>
                  <p className="text-sm font-inter text-gray-600 dark:text-gray-400">
                    EUR {currentSubscription.plan.price}/month
                  </p>
                </div>
                <Crown className="h-8 w-8 text-primary" />
              </div>
            )}

            {/* Show inactive message or expired trial */}
            {(isInactive || currentSubscription.trialExpired || status === 'TRIAL_EXPIRED') && (
              <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertTitle>Trial Expired</AlertTitle>
                <AlertDescription className="space-y-2">
                  <div>
                    {currentSubscription.message ||
                      'Your trial has expired. Please subscribe to continue accepting bookings and creating slots.'}
                  </div>
                  <Button onClick={() => handleSelectPlan('SILVER')} className="mt-3" size="sm">
                    Subscribe Now
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Trial Banner */}
            {isTrial && (
              <Alert className="border-primary bg-primary/10">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle>Trial Period Active</AlertTitle>
                <AlertDescription className="space-y-2">
                  <div>
                    {currentSubscription.message ||
                      `You have ${getDaysInTrial()} days remaining in your trial period. Subscribe to a plan to continue using the platform.`}
                  </div>
                  {currentSubscription.slotsUsed !== undefined &&
                    currentSubscription.slotsLimit !== undefined && (
                      <div className="mt-2 text-sm">
                        <strong>Slots:</strong> {currentSubscription.slotsUsed}/
                        {currentSubscription.slotsLimit} active slots
                        {currentSubscription.slotsUsed >= currentSubscription.slotsLimit && (
                          <span className="ml-2 text-orange-600 dark:text-orange-400">
                            (Limit reached - upgrade to create more)
                          </span>
                        )}
                      </div>
                    )}
                  <Button onClick={() => handleSelectPlan('SILVER')} className="mt-3" size="sm">
                    Upgrade Now
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Cancelled Subscription Banner */}
            {isCancelled && currentSubscription.currentPeriodEnd && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Subscription Cancelled</AlertTitle>
                <AlertDescription>
                  Your subscription will end on{' '}
                  {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}. You will
                  retain access until then.
                </AlertDescription>
              </Alert>
            )}

            {/* Active Subscription Info */}
            {hasPlan && !isTrial && !isCancelled && currentSubscription.currentPeriodEnd && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Next billing date:</span>
                <span className="font-medium">
                  {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            {hasPlan && (
              <div className="flex gap-3">
                <Button
                  onClick={handleOpenBillingPortal}
                  variant="outline"
                  disabled={isLoadingPortal}
                  className="flex-1"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Billing
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                {!isCancelled && (
                  <Button
                    onClick={handleCancel}
                    variant="destructive"
                    disabled={isCanceling}
                    className="flex-1"
                  >
                    Cancel Subscription
                  </Button>
                )}
                {isCancelled && (
                  <Button onClick={handleResume} className="flex-1">
                    Resume Subscription
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="mb-4 text-2xl font-poppins font-bold text-charcoal">
          {currentSubscription?.plan ? 'Upgrade or Change Plan' : 'Choose a Plan'}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlanName={currentSubscription?.plan?.name}
              isRecommended={plan.name === 'SILVER'}
              onSelectPlan={handleSelectPlan}
              isLoading={isSubscribing || isUpdating}
              hasActiveSubscription={userHasActiveSubscription}
            />
          ))}
        </div>
      </div>

      {/* Embedded Checkout Modal */}
      {checkoutClientSecret && (
        <EmbeddedCheckout
          isOpen={isCheckoutOpen}
          clientSecret={checkoutClientSecret}
          onClose={() => {
            setIsCheckoutOpen(false);
            setCheckoutClientSecret(null);
          }}
          onSuccess={() => {
            setIsCheckoutOpen(false);
            setCheckoutClientSecret(null);
            // React Query will automatically refetch subscription
            toast.success('Payment successful! Your subscription is now active.');
            // Refresh to show updated status
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }}
        />
      )}
    </div>
  );
}
