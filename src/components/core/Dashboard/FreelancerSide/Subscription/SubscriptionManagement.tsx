'use client';

import { AlertTriangle, Info } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useBillingPortal,
  useCancelSubscription,
  useCreateCheckoutSession,
  useMySubscription,
  useSubscriptionPlans,
  useUpdateSubscription,
} from '@/hooks/queries/useSubscription';
import { getDecodedToken } from '@/lib/utils';
import { PlanType, SubscriptionStatus } from '@/types/types';

import { BillingTab } from './BillingTab';
import { CancellationDialog } from './CancellationDialog';
import { EmbeddedCheckout } from './EmbeddedCheckout';
import { FeatureComparison } from './FeatureComparison';
import { OverviewTab } from './OverviewTab';
import { PaymentConsent } from './PaymentConsent';
import { PlanCard } from './PlanCard';
import { SubscriptionTabs } from './SubscriptionTabs';

export default function SubscriptionManagement() {
  const searchParams = useSearchParams();
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCancellationDialogOpen, setIsCancellationDialogOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanType | null>(null);
  const [hasPaymentConsent, setHasPaymentConsent] = useState(false);
  const [showPreCheckoutSummary, setShowPreCheckoutSummary] = useState(false);

  // Get default tab from URL query param
  const viewParam = searchParams.get('view');
  const defaultTab: 'overview' | 'billing' | 'plans' =
    viewParam === 'overview' || viewParam === 'billing' || viewParam === 'plans'
      ? viewParam
      : 'overview';

  // Use React Query hooks
  const { data: plans = [], isFetching: initialLoading } = useSubscriptionPlans();
  const {
    data: currentSubscription,
    isFetching: isLoading,
    refetch: refetchSubscription,
  } = useMySubscription();
  const { mutate: createCheckout, isPending: isSubscribing } = useCreateCheckoutSession();
  const { mutate: updateSubscriptionMutation, isPending: isUpdating } = useUpdateSubscription();
  const { mutate: cancelSubscriptionMutation, isPending: isCanceling } = useCancelSubscription();

  // For billing portal, we need to use query with enabled: false and refetch
  const { refetch: refetchBillingPortal } = useBillingPortal();

  // Refetch subscription data when returning from Stripe checkout
  useEffect(() => {
    const subscriptionSuccess = searchParams.get('subscription');

    // If coming from successful subscription, refetch data
    if (subscriptionSuccess === 'success') {
      void refetchSubscription();
      // Clean up URL param after refetching
      const url = new URL(window.location.href);
      url.searchParams.delete('subscription');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, refetchSubscription]);

  // Refetch subscription data when window regains focus (user returns from Stripe)
  useEffect(() => {
    const handleFocus = () => {
      // Only refetch if we don't have recent data or if it's been a while
      void refetchSubscription();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetchSubscription]);

  // Combine loading states - only show loader if no data exists
  const isLoadingPlans =
    initialLoading || (isLoading && plans.length === 0 && !currentSubscription) || isSubscribing;

  const decodedToken = getDecodedToken();
  const subscriptionStatus = decodedToken?.subscriptionStatus;

  const handleSelectPlan = async (planType: PlanType) => {
    try {
      const statusFromState = currentSubscription?.status;
      const hasSubscription = !!currentSubscription;
      const hasPlan = currentSubscription?.plan !== undefined;
      const isCanceledButActive = currentSubscription?.cancelAtPeriodEnd === true;

      const shouldUseUpdate =
        hasSubscription &&
        hasPlan &&
        (statusFromState === 'ACTIVE' || statusFromState === 'TRIALING' || isCanceledButActive);

      if (shouldUseUpdate) {
        updateSubscriptionMutation(
          { planType },
          {
            onSuccess: () => {
              toast.success('Subscription updated successfully!');
            },
            onError: (error: unknown) => {
              const errorMessage =
                error && typeof error === 'object' && 'response' in error
                  ? (error as { response?: { data?: { message?: string } } }).response?.data
                      ?.message || 'Failed to update subscription'
                  : 'Failed to update subscription';
              if (
                errorMessage.includes('No active subscription') ||
                errorMessage.includes('not found') ||
                errorMessage.includes('does not exist')
              ) {
                toast.info('Creating new subscription...');
                handleCheckout(planType);
              } else {
                toast.error(errorMessage);
              }
            },
          },
        );
        return;
      }

      setSelectedPlanForCheckout(planType);
      setShowPreCheckoutSummary(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process subscription';
      toast.error(errorMessage);
    }
  };

  const handleProceedToCheckout = () => {
    if (!hasPaymentConsent) {
      toast.error('Please provide consent for payment data processing');
      return;
    }

    if (!selectedPlanForCheckout) return;

    setShowPreCheckoutSummary(false);
    handleCheckout(selectedPlanForCheckout);
  };

  const handleCheckout = (planType: PlanType) => {
    createCheckout(planType, {
      onSuccess: (checkoutData: unknown) => {
        const data =
          checkoutData && typeof checkoutData === 'object' && 'data' in checkoutData
            ? (checkoutData as { data: { clientSecret?: string; sessionUrl?: string } }).data
            : (checkoutData as { clientSecret?: string; sessionUrl?: string });
        if (data?.clientSecret) {
          setCheckoutClientSecret(data.clientSecret);
          setIsCheckoutOpen(true);
        } else if (data?.sessionUrl) {
          window.location.href = data.sessionUrl;
        }
      },
      onError: (error: unknown) => {
        const errorMessage =
          error && typeof error === 'object' && 'response' in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
              ''
            : '';
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

  const handleCancel = (reason?: string) => {
    cancelSubscriptionMutation(
      { reason },
      {
        onSuccess: () => {
          toast.success('Subscription will be cancelled at the end of the current period.');
          setIsCancellationDialogOpen(false);
        },
        onError: (error: unknown) => {
          const errorMessage =
            error && typeof error === 'object' && 'response' in error
              ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
                'Failed to cancel subscription'
              : 'Failed to cancel subscription';
          toast.error(errorMessage);
        },
      },
    );
  };

  const handleOpenBillingPortal = async () => {
    try {
      const result = await refetchBillingPortal();
      if (result.data) {
        window.open(result.data, '_blank', 'noopener,noreferrer');
      }
    } catch (err: unknown) {
      toast.error('Failed to open billing portal');
    }
  };

  const status: SubscriptionStatus = subscriptionStatus as SubscriptionStatus;
  const isTrial = status === 'TRIALING';
  const isInactive = status === 'INACTIVE' || status === 'UNPAID' || status === 'TRIAL_EXPIRED';
  const userHasActiveSubscription = status === 'ACTIVE' && !!currentSubscription?.plan;

  if (isLoadingPlans) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const selectedPlan = selectedPlanForCheckout
    ? plans.find((p) => p.name === selectedPlanForCheckout)
    : null;

  // Overview Tab Content
  const overviewContent = (
    <OverviewTab
      subscription={currentSubscription || null}
      plan={currentSubscription?.plan}
      onUpgrade={() => handleSelectPlan('SILVER')}
      onManageBilling={handleOpenBillingPortal}
      onCancel={() => setIsCancellationDialogOpen(true)}
      isLoading={isLoading}
    />
  );

  // Billing Tab Content
  const billingContent = <BillingTab />;

  // Plans Tab Content
  const plansContent = (
    <div className="space-y-8">
      {/* Plans Grid - Mobile Horizontal Scroll */}
      <div>
        <div className="mb-6">
          <h3 className="text-2xl font-poppins font-bold text-charcoal mb-2">Choose Your Plan</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select the plan that best fits your needs
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 overflow-x-auto pb-4 md:pb-0 md:overflow-x-visible">
          <div className="flex md:contents gap-6 min-w-full md:min-w-0">
            {plans.map((plan) => (
              <div key={plan.id} className="flex-shrink-0 w-full md:w-auto md:flex-1">
                <PlanCard
                  plan={plan}
                  currentPlanName={currentSubscription?.plan?.name}
                  isRecommended={plan.name === 'SILVER'}
                  onSelectPlan={handleSelectPlan}
                  isLoading={isSubscribing || isUpdating}
                  hasActiveSubscription={userHasActiveSubscription}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      {plans.length > 0 && (
        <div>
          <div className="mb-6">
            <h3 className="text-2xl font-poppins font-bold text-charcoal mb-2">Plan Comparison</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compare features across all plans
            </p>
          </div>
          <FeatureComparison plans={plans} currentPlanName={currentSubscription?.plan?.name} />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header - Simplified */}
      <div>
        <h1 className="text-3xl font-poppins font-bold text-charcoal mb-2">
          Subscription Management
        </h1>
        <p className="text-base font-inter text-gray-600 dark:text-gray-400">
          Manage your subscription plan, billing, and payment methods
        </p>
      </div>

      {/* Inactive/Trial Alerts - More Integrated Design */}
      {/* Only show trial expired alert if status is not ACTIVE or there's no plan */}
      {currentSubscription &&
        isInactive &&
        !(status === 'INACTIVE' && currentSubscription?.plan) && (
          <Alert className="border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <AlertTitle className="text-base font-poppins font-semibold text-orange-900 dark:text-orange-100">
              Trial Expired
            </AlertTitle>
            <AlertDescription className="text-sm text-orange-800 dark:text-orange-200 space-y-3 mt-2">
              <div>
                {currentSubscription.message ||
                  'Your trial has expired. Please subscribe to continue creating slots.'}
              </div>
              <Button
                onClick={() => handleSelectPlan('SILVER')}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white mt-2"
              >
                Subscribe Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

      {currentSubscription && isTrial && (
        <Alert className="border-primary/30 dark:border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-sm">
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="text-base font-poppins font-semibold text-charcoal">
            Trial Period Active
          </AlertTitle>
          <AlertDescription className="text-sm text-gray-700 dark:text-gray-300 mt-2">
            {currentSubscription.message ||
              'You are currently on a free trial. Subscribe to a plan to continue using the platform after your trial ends.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabbed Interface */}
      <SubscriptionTabs
        overviewContent={overviewContent}
        billingContent={billingContent}
        plansContent={plansContent}
        defaultTab={defaultTab}
      />

      {/* Pre-Checkout Summary Dialog */}
      {showPreCheckoutSummary && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-xl font-poppins font-bold">
                Review Your Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-poppins font-semibold text-lg">{selectedPlan.displayName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedPlan.description}
                </p>
                <p className="mt-2 text-2xl font-poppins font-bold text-primary">
                  EUR {selectedPlan.price}/month
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-poppins font-semibold">Features included:</h4>
                <ul className="space-y-1 text-sm">
                  {selectedPlan.features.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <PaymentConsent onConsentChange={setHasPaymentConsent} required={true} />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPreCheckoutSummary(false);
                    setSelectedPlanForCheckout(null);
                    setHasPaymentConsent(false);
                  }}
                  className="flex-1 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToCheckout}
                  disabled={!hasPaymentConsent || isSubscribing}
                  className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubscribing ? 'Processing...' : 'Proceed to Checkout'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cancellation Dialog */}
      <CancellationDialog
        isOpen={isCancellationDialogOpen}
        onClose={() => setIsCancellationDialogOpen(false)}
        onConfirm={handleCancel}
        subscriptionEndDate={currentSubscription?.currentPeriodEnd}
        currentPlan={currentSubscription?.plan}
        isLoading={isCanceling}
      />

      {/* Embedded Checkout Modal */}
      {checkoutClientSecret && (
        <EmbeddedCheckout
          isOpen={isCheckoutOpen}
          clientSecret={checkoutClientSecret}
          onClose={() => {
            setIsCheckoutOpen(false);
            setCheckoutClientSecret(null);
            setHasPaymentConsent(false);
          }}
          onSuccess={() => {
            setIsCheckoutOpen(false);
            setCheckoutClientSecret(null);
            setHasPaymentConsent(false);
            toast.success('Payment successful! Your subscription is now active.');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }}
        />
      )}
    </div>
  );
}
