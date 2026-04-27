'use client';

import { AlertCircle, CreditCard, LogOut } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMySubscription } from '@/hooks/queries/useSubscription';
import { useAuth } from '@/hooks/useAuthZustand';
import { isTrialExpired } from '@/utils/subscriptionHelpers';

export function TrialExpiredModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: subscription, isLoading } = useMySubscription();
  const { logout, role } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if trial has expired (before early returns)
  const trialExpired = subscription ? isTrialExpired(subscription) : false;

  // Check if user is on the subscription page
  const isOnSubscriptionPage =
    pathname === '/dashboard/account' && searchParams.get('tab') === 'subscription';

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    if (trialExpired) {
      try {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
          if (typeof document !== 'undefined' && document.body) {
            document.body.style.overflow = originalOverflow;
          }
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Error setting body overflow:', error.message);
      }
    }
    return undefined;
  }, [trialExpired, isMounted]);

  // Early returns - don't render anything until mounted
  if (!isMounted) {
    return null;
  }

  // Only show for freelancers
  if (role !== 'FREELANCER') {
    return null;
  }

  // Don't show while loading
  if (isLoading || !subscription) {
    return null;
  }

  // Hide modal if user is on subscription page or trial is not expired
  if (!trialExpired || isOnSubscriptionPage) {
    return null;
  }

  const handleSubscribe = () => {
    try {
      router.push('/dashboard/account?tab=subscription&view=plans');
    } catch (error) {
      console.error('Error navigating to subscription:', error);
      window.location.href = '/dashboard/account?tab=subscription&view=plans';
    }
  };

  const handleLogout = () => {
    try {
      logout();
      router.push('/authentication/sign-in');
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = '/authentication/sign-in';
    }
  };

  return (
    <Dialog open={true} modal={true}>
      <DialogContent
        className="sm:max-w-[500px] [&>button]:hidden z-[9999]"
        style={{ zIndex: 9999 }}
        onInteractOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-red-100
              <AlertCircle className="h-6 w-6 text-red-600 />
            </div>
            <DialogTitle className="text-2xl font-poppins font-bold text-charcoal">
              Trial Expired
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-gray-700 pt-2">
            Your 30-day free trial has expired. To continue using TheraSynced and access all
            features, please subscribe to a plan.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-gray-900
              What happens next?
            </p>
            <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
              <li>Subscribe to a plan to regain full platform access</li>
              <li>Choose from Bronze, Silver, or Gold tiers</li>
              <li>Start accepting bookings and managing your practice</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
          <Button
            onClick={handleSubscribe}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 order-1 sm:order-2"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Subscribe to a Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
