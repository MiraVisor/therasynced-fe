import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

interface VerificationBadgeProps {
  status:
    | 'verified'
    | 'pending'
    | 'rejected'
    | 'unverified'
    | 'APPROVED'
    | 'PENDING'
    | 'REJECTED'
    | 'UNVERIFIED';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  size = 'md',
  showText = true,
  className,
}) => {
  const getStatusConfig = () => {
    // Normalize status to lowercase for consistent handling
    const normalizedStatus = status?.toLowerCase();

    switch (normalizedStatus) {
      case 'verified':
      case 'approved':
        return {
          icon: CheckCircle,
          text: 'Verified',
          className:
            'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
          iconClassName: 'text-green-600 dark:text-green-400',
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending',
          className:
            'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
          iconClassName: 'text-yellow-600 dark:text-yellow-400',
        };
      case 'rejected':
        return {
          icon: XCircle,
          text: 'Rejected',
          className:
            'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
          iconClassName: 'text-red-600 dark:text-red-400',
        };
      case 'unverified':
      default:
        return {
          icon: AlertCircle,
          text: 'Unverified',
          className:
            'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
          iconClassName: 'text-gray-600 dark:text-gray-400',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
          text: 'text-xs',
        };
      case 'lg':
        return {
          container: 'px-3 py-1.5 text-sm',
          icon: 'w-5 h-5',
          text: 'text-sm',
        };
      case 'md':
      default:
        return {
          container: 'px-2.5 py-1 text-xs',
          icon: 'w-4 h-4',
          text: 'text-xs',
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = getSizeClasses();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        config.className,
        sizeClasses.container,
        className,
      )}
    >
      <Icon className={cn(sizeClasses.icon, config.iconClassName)} />
      {showText && <span className={cn('font-medium', sizeClasses.text)}>{config.text}</span>}
    </div>
  );
};

// Avatar with verification ring
// Shows a colored ring around the avatar based on verification status:
// - Verified/Approved: Blue ring with subtle shadow
// - Pending: No ring (clean avatar)
// - Rejected: No ring (clean avatar)
// - Unverified: No ring (clean avatar)
interface VerifiedAvatarProps {
  name: string;
  verificationStatus?:
    | 'verified'
    | 'pending'
    | 'rejected'
    | 'unverified'
    | 'APPROVED'
    | 'PENDING'
    | 'REJECTED'
    | 'UNVERIFIED';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const VerifiedAvatar: React.FC<VerifiedAvatarProps> = ({
  name,
  verificationStatus,
  size = 'md',
  className,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          avatar: 'w-8 h-8',
          ring: 'ring-2',
          text: 'text-xs',
        };
      case 'lg':
        return {
          avatar: 'w-16 h-16',
          ring: 'ring-3',
          text: 'text-lg',
        };
      case 'xl':
        return {
          avatar: 'w-20 h-20',
          ring: 'ring-4',
          text: 'text-xl',
        };
      case 'md':
      default:
        return {
          avatar: 'w-10 h-10',
          ring: 'ring-2',
          text: 'text-sm',
        };
    }
  };

  const getVerificationRing = () => {
    const normalizedStatus = verificationStatus?.toLowerCase();

    switch (normalizedStatus) {
      case 'verified':
      case 'approved':
        return 'ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800';
      case 'pending':
      case 'rejected':
      case 'unverified':
      default:
        return '';
    }
  };

  const sizeClasses = getSizeClasses();
  const ringClasses = getVerificationRing();

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold transition-all duration-200',
          sizeClasses.avatar,
          sizeClasses.text,
          ringClasses ? `${sizeClasses.ring} ${ringClasses}` : '',
          // Add subtle shadow for verified users
          verificationStatus?.toLowerCase() === 'verified' ||
            verificationStatus?.toLowerCase() === 'approved'
            ? 'shadow-lg shadow-blue-500/20'
            : '',
        )}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    </div>
  );
};
