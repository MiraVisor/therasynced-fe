/**
 * Subscription state management utility functions
 * These helpers provide a consistent way to check subscription states across the application
 */
import { Subscription } from '@/types/subscription';

export interface SubscriptionState {
  isInTrial: boolean;
  isActive: boolean;
  isCanceled: boolean;
  isInGracePeriod: boolean;
  canResume: boolean;
  trialEndDate: Date | null;
  gracePeriodEndDate: Date | null;
}

/**
 * Get the correct trial end date from subscription
 * Priority: trialEnd (Stripe subscription trial) > trialEndsAt (standalone trial)
 */
export function getTrialEndDate(subscription: Subscription | null): Date | null {
  if (!subscription) return null;

  // Priority: trialEnd (Stripe subscription trial) > trialEndsAt (standalone trial)
  if (subscription.trialEnd) {
    return new Date(subscription.trialEnd);
  }
  if (subscription.trialEndsAt) {
    return new Date(subscription.trialEndsAt);
  }
  return null;
}

/**
 * Check if user is in any type of trial
 */
export function isInTrial(subscription: Subscription | null): boolean {
  if (!subscription) return false;

  // Check if status is TRIALING
  if (subscription.status === 'TRIALING') {
    return true;
  }

  // Check if there's a standalone trial (trialEndsAt in future)
  const trialEndDate = getTrialEndDate(subscription);
  if (trialEndDate) {
    return trialEndDate > new Date();
  }

  return false;
}

/**
 * Check if subscription is in grace period
 */
export function isInGracePeriod(subscription: Subscription | null): boolean {
  if (!subscription) return false;

  // Check if status is PAST_DUE
  if (subscription.status === 'PAST_DUE') {
    return true;
  }

  // Check if gracePeriodEndsAt exists and is in the future
  // Note: gracePeriodEndsAt might not be in the type yet, so we check it safely
  const subscriptionWithGrace = subscription as Subscription & {
    gracePeriodEndsAt?: string | null;
  };
  if (subscriptionWithGrace.gracePeriodEndsAt) {
    const graceEnd = new Date(subscriptionWithGrace.gracePeriodEndsAt);
    return graceEnd > new Date();
  }

  return false;
}

/**
 * Get grace period end date
 */
export function getGracePeriodEndDate(subscription: Subscription | null): Date | null {
  if (!subscription) return null;

  const subscriptionWithGrace = subscription as Subscription & {
    gracePeriodEndsAt?: string | null;
  };
  if (subscriptionWithGrace.gracePeriodEndsAt) {
    return new Date(subscriptionWithGrace.gracePeriodEndsAt);
  }

  return null;
}

/**
 * Check if subscription can be resumed
 */
export function canResume(subscription: Subscription | null): boolean {
  if (!subscription) return false;

  // Can resume if cancelAtPeriodEnd is true and status is still ACTIVE
  return subscription.cancelAtPeriodEnd === true && subscription.status === 'ACTIVE';
}

/**
 * Determine if resume button should show
 */
export function shouldShowResumeButton(subscription: Subscription | null): boolean {
  return canResume(subscription);
}

/**
 * Get comprehensive subscription state object
 */
export function getSubscriptionState(subscription: Subscription | null): SubscriptionState {
  return {
    isInTrial: isInTrial(subscription),
    isActive: subscription?.status === 'ACTIVE',
    isCanceled: subscription?.status === 'CANCELED' || subscription?.cancelAtPeriodEnd === true,
    isInGracePeriod: isInGracePeriod(subscription),
    canResume: canResume(subscription),
    trialEndDate: getTrialEndDate(subscription),
    gracePeriodEndDate: getGracePeriodEndDate(subscription),
  };
}

/**
 * Format limit display - returns "Unlimited" or the number
 */
export function formatLimit(limit: number | null | undefined): string {
  if (limit === null || limit === undefined) {
    return 'Unlimited';
  }
  return limit.toString();
}

/**
 * Get billing cycle end date from subscription
 */
export function getBillingCycleEndDate(subscription: Subscription | null): Date | null {
  if (!subscription?.currentPeriodEnd) {
    return null;
  }
  return new Date(subscription.currentPeriodEnd);
}

/**
 * Get days until billing cycle reset
 */
export function getDaysUntilBillingCycleReset(subscription: Subscription | null): number | null {
  const endDate = getBillingCycleEndDate(subscription);
  if (!endDate) {
    return null;
  }
  const now = new Date();
  const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

/**
 * Check if usage is approaching limit (default threshold: 80%)
 */
export function isApproachingLimit(
  used: number,
  limit: number | null | undefined,
  threshold: number = 80,
): boolean {
  if (limit === null || limit === undefined || limit === 0) {
    return false; // Unlimited or invalid limit
  }
  const percentage = (used / limit) * 100;
  return percentage >= threshold;
}

/**
 * Check if trial has expired
 */
export function isTrialExpired(subscription: Subscription | null): boolean {
  if (!subscription) return false;

  // Check if status is explicitly TRIAL_EXPIRED
  if (subscription.status === 'TRIAL_EXPIRED' || subscription.trialExpired === true) {
    return true;
  }

  // Check if trial end date has passed
  const trialEndDate = getTrialEndDate(subscription);
  if (trialEndDate) {
    return trialEndDate <= new Date();
  }

  // Check if status is INACTIVE and user had a trial (no active subscription)
  if (subscription.status === 'INACTIVE' && !subscription.plan) {
    // If there was a trial end date, consider it expired
    return !!trialEndDate;
  }

  return false;
}
