'use client';

import { X } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getMySubscription } from '@/redux/api/subscriptionApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks/useAppHooks';

export default function TrialBanner() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentSubscription, isLoading } = useAppSelector((state) => state.subscription);

  const [isDismissed, setIsDismissed] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    // Load subscription status
    dispatch(getMySubscription());
  }, [dispatch]);

  useEffect(() => {
    // Check if banner was dismissed today
    const today = new Date().toDateString();
    const dismissedDate = localStorage.getItem('trialBannerDismissed');
    if (dismissedDate === today) {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    const endDate = currentSubscription?.trialEnd || currentSubscription?.trialEndsAt;
    if (endDate) {
      const end = new Date(endDate);
      const now = new Date();
      const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setDaysRemaining(diff);
    }
  }, [currentSubscription]);

  const handleDismiss = () => {
    setIsDismissed(true);
    const today = new Date().toDateString();
    localStorage.setItem('trialBannerDismissed', today);
  };

  const isTrialActive = currentSubscription?.status === 'TRIALING';
  const showBanner = isTrialActive && !isDismissed && daysRemaining !== null && daysRemaining > 0;

  if (isLoading || !showBanner || daysRemaining === null) {
    return null;
  }

  const isLowDays = daysRemaining <= 3;

  return (
    <Alert
      className={`border-orange-500 bg-orange-50 dark:bg-orange-900/20 ${
        isLowDays ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className={`h-5 w-5 ${isLowDays ? 'text-red-600' : 'text-orange-600'}`} />
          <div className="flex-1">
            <AlertTitle className="font-semibold text-gray-900 dark:text-white">
              {isLowDays ? 'Trial Ending Soon!' : 'Free Trial Active'}
            </AlertTitle>
            <AlertDescription className="mt-1 text-gray-700 dark:text-gray-300">
              {isLowDays
                ? `Your free trial ends in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}. Subscribe now to continue using TheraSynced without interruption.`
                : `Your free trial is active for ${daysRemaining} more ${daysRemaining === 1 ? 'day' : 'days'}. Explore all features and subscribe when you're ready!`}
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
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
}
