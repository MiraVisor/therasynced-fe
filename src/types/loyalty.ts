/**
 * Loyalty and stamp system types
 */
import type { LoyaltyTier } from './enums';

export interface LoyaltyProfile {
  id: string;
  userId: string;
  totalPoints: number;
  availablePoints: number;
  tier: LoyaltyTier;
  tierBenefits: string[];
  nextTier: LoyaltyTier;
  pointsToNextTier: number;
  pointTransactions: PointTransaction[];
  redemptions: Redemption[];
}

export interface PointTransaction {
  id: string;
  loyaltyProfileId: string;
  points: number;
  type: 'EARNED' | 'SPENT' | 'EXPIRED';
  description: string;
  bookingId?: string;
  createdAt: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
}

export interface Redemption {
  id: string;
  loyaltyProfileId: string;
  rewardId: string;
  reward: LoyaltyReward;
  pointsSpent: number;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED';
  fulfilledAt?: string;
  createdAt: string;
}

// Therapist Stamp System Types
export interface TherapistStampSummary {
  therapist: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
  currentStampCount: number;
  stampTarget: number;
  stampsRemaining: number;
  rewardReady: boolean;
  rewardReserved: boolean;
  rewardCyclesCompleted: number;
  lastStampIssuedAt: string | null;
  rewardReadySince: string | null;
  discountPercentage: number;
  customConfigApplied: boolean;
}

export interface TherapistStampDetail {
  therapist: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
  currentStampCount: number;
  stampTarget: number;
  stampsRemaining: number;
  rewardReady: boolean;
  rewardReserved: boolean;
  rewardReadySince: string | null;
  totalStampsEarned: number;
  rewardCyclesCompleted: number;
  lastStampIssuedAt: string | null;
  lastResetAt: string | null;
  histories: StampHistory[];
  discountPercentage: number;
  customConfigApplied: boolean;
}

export interface StampHistory {
  id: string;
  eventType:
    | 'STAMP_AWARDED'
    | 'REWARD_READY'
    | 'REWARD_RESERVED'
    | 'REWARD_CONSUMED'
    | 'REWARD_RELEASED'
    | 'STAMP_RESET';
  notes: string | null;
  bookingId: string | null;
  stampNumber: number | null;
  createdAt: string;
}

export interface TherapistStampConfig {
  therapistId: string;
  stampTarget: number | null;
  discountPercentage: number | null;
  isActive: boolean;
  customConfigApplied: boolean;
  createdAt: string;
  updatedAt: string;
  therapist?: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
}

export interface CreateTherapistStampConfigDto {
  therapistId: string;
  stampTarget?: number;
  discountPercentage?: number;
  isActive?: boolean;
}

export interface UpdateTherapistStampConfigDto {
  stampTarget?: number;
  discountPercentage?: number;
  isActive?: boolean;
}

export interface BulkTherapistStampConfigDto {
  stampTarget: number;
  discountPercentage: number;
  isActive?: boolean;
}
