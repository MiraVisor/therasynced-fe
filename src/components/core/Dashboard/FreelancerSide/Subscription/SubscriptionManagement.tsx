'use client';

import { AlertTriangle, CreditCard, Crown, ExternalLink, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// Note: Skeleton import is correct - it's defined in src/components/ui/skeleton.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getDecodedToken } from '@/lib/utils';
import {
  cancelSubscription,
  createCheckoutSession,
  getBillingPortal,
  getMySubscription,
  getSubscriptionPlans,
  resumeSubscription,
  updateSubscription,
} from '@/redux/api/subscriptionApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks/useAppHooks';
import { PlanType } from '@/types/types';

import { EmbeddedCheckout } from './EmbeddedCheckout';
import { PlanCard } from './PlanCard';

export default function SubscriptionManagement() {
  const dispatch = useAppDispatch();

  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const {
    plans,
    currentSubscription,
    isLoading,
    initialLoading,
    isSubscribing,
    isUpdating,
    isCanceling,
    error,
  } = useAppSelector((state) => state.subscription);

  // Combine loading states - only show loader if no data exists
  const isLoadingPlans =
    initialLoading ||
    (isLoading && plans.length === 0 && !currentSubscription) ||
    isRedirectingToCheckout;

  useEffect(() => {
    // Load plans and subscription on mount - use silent refresh if data exists
    const hasPlans = plans.length > 0;
    const hasSubscription = currentSubscription !== null;
    dispatch(getSubscriptionPlans({ silent: hasPlans }));
    dispatch(getMySubscription({ silent: hasSubscription }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]); // Only run once on mount, not when plans/subscription change

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

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
      const statusFromToken = subscriptionStatus;
      // Use state status first, fall back to token only if state is missing
      const currentStatus = statusFromState || statusFromToken;

      // Check if subscription exists
      const hasSubscription = !!currentSubscription;

      // Determine if subscription is active
      // Active means: ACTIVE/TRIALING status OR canceled but still active until period end
      const isActiveStatus = currentStatus === 'ACTIVE' || currentStatus === 'TRIALING';
      const isCanceledButActive = currentSubscription?.cancelAtPeriodEnd === true;

      // Decision: Use update endpoint if we have a subscription that appears active
      // We check statusFromState directly to avoid token staleness issues
      // If statusFromState is ACTIVE or TRIALING, definitely use update
      // If statusFromState is missing but we have currentSubscription, also try update
      // (backend will validate and error if needed)
      const shouldUseUpdate =
        hasSubscription &&
        (statusFromState === 'ACTIVE' ||
          statusFromState === 'TRIALING' ||
          isActiveStatus ||
          isCanceledButActive);

      if (shouldUseUpdate) {
        const result = await dispatch(updateSubscription({ planType }));
        if (updateSubscription.fulfilled.match(result)) {
          toast.success('Subscription updated successfully!');
          // Refresh subscription data silently
          dispatch(getMySubscription({ silent: true }));
          return; // Exit early on success
        } else if (updateSubscription.rejected.match(result)) {
          const errorMessage = (result.payload as string) || 'Failed to update subscription';
          // If update fails with "No active subscription", try checkout instead
          if (
            errorMessage.includes('No active subscription') ||
            errorMessage.includes('not found') ||
            errorMessage.includes('does not exist')
          ) {
            toast.info('Creating new subscription...');
            // Fall through to checkout flow
          } else {
            toast.error(errorMessage);
            return;
          }
        } else {
          return; // Update succeeded, exit early
        }
      }

      // No active subscription or update failed - use checkout endpoint
      setIsRedirectingToCheckout(true);
      const result = await dispatch(createCheckoutSession(planType));
      if (createCheckoutSession.fulfilled.match(result)) {
        // Open embedded checkout with client secret
        const checkoutData = result.payload as {
          sessionUrl: string;
          sessionId: string;
          clientSecret?: string;
        };
        // Use clientSecret if available for embedded checkout
        // Note: Backend needs to return clientSecret for embedded checkout to work
        // If not available, fall back to redirect mode
        if (checkoutData.clientSecret) {
          setCheckoutClientSecret(checkoutData.clientSecret);
          setIsCheckoutOpen(true);
          setIsRedirectingToCheckout(false);
        } else {
          // Fallback to redirect if no client secret (backend doesn't support embedded yet)
          window.location.href = checkoutData.sessionUrl;
          setIsRedirectingToCheckout(false);
        }
      } else {
        // If checkout fails with "already have an active subscription" error, try update instead
        const errorMessage = (result.payload as string) || '';
        if (
          errorMessage.includes('already have an active subscription') ||
          errorMessage.includes('already subscribed')
        ) {
          toast.info('Updating existing subscription...');
          const updateResult = await dispatch(updateSubscription({ planType }));
          if (updateSubscription.fulfilled.match(updateResult)) {
            toast.success('Subscription updated successfully!');
            // Refresh subscription data
            dispatch(getMySubscription({ silent: true }));
          } else {
            toast.error('Failed to update subscription');
          }
        } else {
          toast.error('Failed to create checkout session');
        }
        setIsRedirectingToCheckout(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to process subscription');
      setIsRedirectingToCheckout(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    const result = await dispatch(cancelSubscription({}));
    if (cancelSubscription.fulfilled.match(result)) {
      toast.success('Subscription will be cancelled at the end of the current period.');
      // Refresh subscription data
      dispatch(getMySubscription({ silent: true }));
    }
  };

  const handleResume = async () => {
    const result = await dispatch(resumeSubscription());
    if (resumeSubscription.fulfilled.match(result)) {
      toast.success('Subscription resumed successfully!');
      // Refresh subscription data
      dispatch(getMySubscription({ silent: true }));
    }
  };

  const handleOpenBillingPortal = async () => {
    try {
      setIsLoadingPortal(true);
      const result = await dispatch(getBillingPortal());
      if (getBillingPortal.fulfilled.match(result)) {
        // Open billing portal in new tab
        window.open(result.payload, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      toast.error('Failed to open billing portal');
    } finally {
      setIsLoadingPortal(false);
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
        {isRedirectingToCheckout && (
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

            {/* Show inactive message */}
            {isInactive && (
              <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
                <Info className="h-4 w-4 text-orange-600" />
                <AlertTitle>Trial Expired</AlertTitle>
                <AlertDescription>
                  {currentSubscription.message ||
                    'Please subscribe to continue using the platform.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Trial Banner */}
            {isTrial && (
              <Alert className="border-primary bg-primary/10">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle>Trial Period Active</AlertTitle>
                <AlertDescription>
                  You have {getDaysInTrial()} days remaining in your trial period. Subscribe to a
                  plan to continue using the platform.
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
          {currentSubscription && currentSubscription.plan
            ? 'Upgrade or Change Plan'
            : 'Choose a Plan'}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlanName={currentSubscription?.plan?.name}
              isRecommended={plan.name === 'SILVER'}
              onSelectPlan={handleSelectPlan}
              isLoading={isSubscribing || isUpdating || isRedirectingToCheckout}
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
          onSuccess={async () => {
            setIsCheckoutOpen(false);
            setCheckoutClientSecret(null);
            // Refresh subscription data
            await dispatch(getMySubscription({ silent: true }));
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
