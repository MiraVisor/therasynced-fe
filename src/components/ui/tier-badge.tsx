import { cn } from '@/lib/utils';
import { SubscriptionPlanType } from '@/types/types';
import { getTierColor, getTierDisplayName, getTierIcon } from '@/utils/tierUtils';

interface TierBadgeProps {
  tier: SubscriptionPlanType | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  size = 'md',
  showIcon = true,
  className,
}) => {
  if (!tier) return null;

  const color = getTierColor(tier);
  const displayName = getTierDisplayName(tier);
  const Icon = getTierIcon(tier);

  // Tier-specific styling
  const tierStyles: Record<SubscriptionPlanType, string> = {
    GOLD: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-500 shadow-sm',
    SILVER: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900 border-gray-400 shadow-sm',
    BRONZE: 'bg-gradient-to-r from-amber-700 to-amber-800 text-white border-amber-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        sizeClasses[size],
        tierStyles[tier],
        className,
      )}
      style={{ borderColor: color }}
      aria-label={`${displayName} tier freelancer`}
    >
      {showIcon && <Icon className={cn(iconSizeClasses[size], 'flex-shrink-0')} />}
      <span>{displayName}</span>
    </span>
  );
};

export default TierBadge;
