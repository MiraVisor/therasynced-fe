'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { verifyCheckoutSession } from '@/redux/api/subscriptionApi';
import { useAppDispatch } from '@/redux/hooks/useAppHooks';

function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Verify payment using the verify-checkout endpoint
    const verifyPayment = async () => {
      try {
        if (sessionId) {
          // Verify checkout session with backend
          const result = await dispatch(verifyCheckoutSession(sessionId) as any);

          if (verifyCheckoutSession.fulfilled.match(result)) {
            setIsLoading(false);
            toast.success('Payment successful! Your subscription is now active.');

            // Redirect to subscription management after a short delay
            setTimeout(() => {
              router.push('/dashboard/account?tab=subscription');
            }, 3000);
          } else {
            // Payment verification failed
            const errorMessage = (result.payload as string) || 'Payment verification failed';
            setIsLoading(false);
            setError(errorMessage);
            toast.error(`Payment verification failed: ${errorMessage}`);
          }
        } else {
          setIsLoading(false);
          setError('No session ID found');
          toast.error('No session ID found. Please contact support if payment was successful.');
        }
      } catch (error) {
        setIsLoading(false);
        const errorMessage = error instanceof Error ? error.message : 'Failed to verify payment';
        setError(errorMessage);
        toast.error(`Failed to verify payment: ${errorMessage}`);
      }
    };

    verifyPayment();
  }, [sessionId, dispatch, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription className="mt-2">
            {error
              ? 'There was an issue verifying your payment. Please contact support if payment was successful.'
              : 'Your subscription has been activated successfully. You will be redirected to your subscription page shortly.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {sessionId && !error && (
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Session ID: <span className="font-mono text-xs">{sessionId}</span>
              </p>
            </div>
          )}
          <Button
            onClick={() => router.push('/dashboard/account?tab=subscription')}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Go to Subscription Page
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
