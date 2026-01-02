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
