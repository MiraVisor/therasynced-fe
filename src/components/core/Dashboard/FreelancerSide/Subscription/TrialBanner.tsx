'use client';

import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getDecodedToken } from '@/lib/utils';

export default function TrialBanner() {
  const router = useRouter();
  const decodedToken = getDecodedToken();
  const subscriptionStatus = decodedToken?.subscriptionStatus;

  // Always show banner if status is TRIALING
  if (subscriptionStatus !== 'TRIALING') {
    return null;
  }

  return (
    <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <div className="flex-1">
            <AlertTitle className="font-semibold text-gray-900 dark:text-white">
              Free Trial Active
            </AlertTitle>
            <AlertDescription className="mt-1 text-gray-700 dark:text-gray-300">
              Your free trial is active. Explore all features and subscribe when you&apos;re ready!
            </AlertDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push('/dashboard/account?tab=subscription')}
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            Choose Plan
          </Button>
        </div>
      </div>
    </Alert>
  );
}
