'use client';

import { ArrowRight, Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useMySubscription, useVerifyCheckoutSession } from '@/hooks/queries/useSubscription';

function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: verifyCheckout, isPending: isLoading } = useVerifyCheckoutSession();
  const { data: subscription, refetch: refetchSubscription } = useMySubscription();
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId && !isVerified) {
      verifyCheckout(sessionId, {
        onSuccess: () => {
          setIsVerified(true);
          void refetchSubscription();
          // Small delay to show success animation
          setTimeout(() => {
            router.push('/dashboard/account?tab=subscription&subscription=success');
          }, 2000);
        },
        onError: (error: unknown) => {
          const apiError = error as { response?: { data?: { message?: string } } };
          const errorMessage = apiError?.response?.data?.message || 'Payment verification failed';
          setError(errorMessage);
        },
      });
    } else if (!sessionId) {
      setError('No session ID found');
      toast.error('No session ID found. Please contact support if payment was successful.');
    }
  }, [sessionId, verifyCheckout, router, isVerified, refetchSubscription]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-600 your payment...</p>">
        </div>
      </div>
    );
  }

  const nextBillingDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 animate-in zoom-in duration-500">
            <CheckCircle2 className="h-8 w-8 text-green-600 animate-in zoom-in duration-300 delay-200" />
          </div>
          <CardTitle className="text-2xl font-poppins font-bold">Payment Successful!</CardTitle>
          <CardDescription className="mt-2">
            {error
              ? 'There was an issue verifying your payment. Please contact support if payment was successful.'
              : isVerified
                ? 'Your subscription has been activated successfully!'
                : 'Verifying your payment...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
              <p className="mt-1 text-sm text-red-600">
              <p className="mt-2 text-xs text-red-600">
                If your payment was successful, please contact support with your session ID.
              </p>
            </div>
          )}

          {isVerified && subscription && !error && (
            <div className="space-y-3 rounded-lg border bg-primary/5 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-poppins font-semibold">Subscription Activated</h3>
              </div>
              {subscription.plan && (
                <div>
                  <p className="text-sm text-gray-600">
                  <p className="font-poppins font-semibold text-lg">
                    {subscription.plan.displayName}
                  </p>
                </div>
              )}
              {nextBillingDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 billing date</p>">
                    <p className="font-medium">
                      {nextBillingDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {sessionId && !error && !isVerified && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-600">
                Session ID: <span className="font-mono text-xs">{sessionId}</span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={() => router.push('/dashboard/account?tab=subscription')}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              Go to Subscription Page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
