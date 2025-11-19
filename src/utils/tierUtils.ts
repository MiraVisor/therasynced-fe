import { Circle, Crown, Star } from 'lucide-react';

import { SubscriptionPlanType } from '@/types/types';
import { Expert } from '@/types/types';

/**
 * Get color scheme for a tier
 */
export const getTierColor = (tier: SubscriptionPlanType | null | undefined): string => {
  if (!tier) return '#6B7280'; // Default gray
  switch (tier) {
    case 'GOLD':
      return '#FFD700'; // Gold
    case 'SILVER':
      return '#C0C0C0'; // Silver
    case 'BRONZE':
      return '#CD7F32'; // Bronze
    default:
      return '#6B7280';
  }
};

/**
 * Get badge variant classes for a tier
 */
export const getTierBadgeVariant = (
  tier: SubscriptionPlanType | null | undefined,
): 'default' | 'secondary' | 'outline' => {
  if (!tier) return 'outline';
  switch (tier) {
    case 'GOLD':
      return 'default';
    case 'SILVER':
      return 'secondary';
    case 'BRONZE':
      return 'outline';
    default:
      return 'outline';
  }
};

/**
 * Get icon component for a tier
 */
export const getTierIcon = (tier: SubscriptionPlanType | null | undefined) => {
  if (!tier) return Circle;
  switch (tier) {
    case 'GOLD':
      return Crown;
    case 'SILVER':
      return Star;
    case 'BRONZE':
      return Circle;
    default:
      return Circle;
  }
};

/**
 * Get display name for a tier
 */
export const getTierDisplayName = (tier: SubscriptionPlanType | null | undefined): string => {
  if (!tier) return 'Standard';
  switch (tier) {
    case 'GOLD':
      return 'Gold';
    case 'SILVER':
      return 'Silver';
    case 'BRONZE':
      return 'Bronze';
    default:
      return 'Standard';
  }
};

/**
 * Group freelancers by tier
 */
export const groupFreelancersByTier = (
  freelancers: Expert[],
): {
  gold: Expert[];
  silver: Expert[];
  bronze: Expert[];
  noTier: Expert[];
} => {
  const grouped = {
    gold: [] as Expert[],
    silver: [] as Expert[],
    bronze: [] as Expert[],
    noTier: [] as Expert[],
  };

  freelancers.forEach((freelancer) => {
    const tier = freelancer.tier || freelancer.planFeatures?.planType;
    if (!tier) {
      grouped.noTier.push(freelancer);
    } else {
      switch (tier) {
        case 'GOLD':
          grouped.gold.push(freelancer);
          break;
        case 'SILVER':
          grouped.silver.push(freelancer);
          break;
        case 'BRONZE':
          grouped.bronze.push(freelancer);
          break;
        default:
          grouped.noTier.push(freelancer);
      }
    }
  });

  return grouped;
};

/**
 * Sort freelancers by tier priority (Gold > Silver > Bronze > No Tier)
 */
export const sortFreelancersByTier = (freelancers: Expert[]): Expert[] => {
  const tierPriority: Record<string, number> = {
    GOLD: 3,
    SILVER: 2,
    BRONZE: 1,
  };

  return [...freelancers].sort((a, b) => {
    const tierA = a.tier || a.planFeatures?.planType || '';
    const tierB = b.tier || b.planFeatures?.planType || '';
    const priorityA = tierPriority[tierA] || 0;
    const priorityB = tierPriority[tierB] || 0;
    return priorityB - priorityA; // Higher priority first
  });
};

/**
 * Get the current featured tier based on daily rotation
 * Rotates daily: Gold → Silver → Bronze → repeat
 */
export const getCurrentFeaturedTier = (): 'gold' | 'silver' | 'bronze' => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const tiers: ('gold' | 'silver' | 'bronze')[] = ['gold', 'silver', 'bronze'];
  return tiers[dayOfYear % 3];
};

/**
 * Get the current featured tier based on hourly rotation (every 8 hours)
 * Alternative rotation method: Gold (0-8h), Silver (8-16h), Bronze (16-24h)
 */
export const getCurrentFeaturedTierHourly = (): 'gold' | 'silver' | 'bronze' => {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 8) return 'gold';
  if (hour >= 8 && hour < 16) return 'silver';
  return 'bronze';
};
