/**
 * Subscription-related types
 */
import type { TierType } from './enums';

export type PlanType = 'BRONZE' | 'SILVER' | 'GOLD';
export type SubscriptionPlanType = 'BRONZE' | 'SILVER' | 'GOLD';

export interface PlanFeatures {
  planType: SubscriptionPlanType;
  planDisplayName: string;
  searchPriority: number;
  canToggleReviews: boolean;
  analyticsAccess: boolean;
  monthlyReportEnabled: boolean;
  reminderClientEnabled: boolean;
  reminderFreelancerEnabled: boolean;
  notifyOnBooking: boolean;
  notifyOnCancellation: boolean;
  notifyOnReminder: boolean;
}

export interface SubscriptionInfo {
  planName: 'Bronze' | 'Silver' | 'Gold' | 'Trial' | null;
  maxSlots: number | null; // null = unlimited (Gold plan)
  activeSlotsCount: number; // Count of AVAILABLE + RESERVED + BOOKED slots
  remainingSlots: number | null; // null if unlimited, otherwise maxSlots - activeSlotsCount
  isUnlimited: boolean; // true for Gold plan
}

export type SubscriptionStatus =
  | 'TRIALING'
  | 'TRIAL_EXPIRED'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'UNPAID'
  | 'INACTIVE';

export interface SubscriptionPlan {
  id: string;
  name: PlanType;
  displayName: string;
  description: string;
  price: number;
  billingInterval: string;
  stripePriceId: string;
  maxSlots: number | null; // null = unlimited
  commissionRate: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string | null;
  userId?: string;
  planId?: string;
  plan?: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  trialStart?: string;
  trialEnd?: string;
  trialEndsAt: string | null; // Required field from API
  canceledAt?: string | null;
  createdAt?: string;
  subscription?: Subscription | null; // Nested subscription details if active
  isInTrial?: boolean;
  trialExpired?: boolean; // true if trial has expired
  gracePeriodEndsAt?: string | null; // Grace period end date (7 days after payment failure)
  canCreateSlots: boolean; // Required field from API
  canAcceptBookings: boolean; // Required field from API
  slotsUsed: number; // Required field from API - Current active slots count
  slotsLimit: number | null; // Required field from API - Slot limit (null = unlimited)
  maxDaysPerWeek: number | null; // Days per week limit (null = unlimited)
  maxMessagesPerBillingCycle: number | null; // Messages per billing cycle limit (null = unlimited)
  canToggleRatingVisibility: boolean; // Whether user can toggle rating visibility
  messagesUsed?: number; // Optional - Messages used in current billing cycle
  daysUsed?: number; // Optional - Days used in current week
  message: string; // Required field from API - Status message
}

export interface SubscriptionState {
  isInTrial: boolean;
  isActive: boolean;
  isCanceled: boolean;
  isInGracePeriod: boolean;
  canResume: boolean;
  trialEndDate: Date | null;
  gracePeriodEndDate: Date | null;
}

export interface SubscriptionCreationData {
  subscription: Subscription;
  clientSecret: string;
}

export interface UpdateSubscriptionDto {
  planType: PlanType;
}

export interface CancelSubscriptionDto {
  reason?: string;
}

export interface SubscriptionPlansResponse {
  success: boolean;
  data: SubscriptionPlan[];
}

export interface SubscriptionResponse {
  success: boolean;
  data: Subscription;
}

// Tier Rotation Types
export interface RotationInfo {
  method: 'daily';
  nextRotation: string; // ISO timestamp (UTC)
}

export interface TierFreelancerResponse {
  success: boolean;
  message: string;
  data: unknown[]; // Freelancer objects
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  featuredTier?: TierType;
  rotationInfo?: RotationInfo;
  meta: {
    timestamp: string;
    path: string;
  };
}

export interface CreateSubscriptionResponseData {
  success: boolean;
  data: SubscriptionCreationData;
}

export interface BillingPortalResponse {
  success: boolean;
  data: {
    url: string;
  };
}

export interface CheckoutSessionResponse {
  success: boolean;
  data: {
    clientSecret?: string;
    sessionUrl?: string;
  };
}
