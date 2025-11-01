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
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  size = 'md',
  className,
}) => {
  const isVerified = () => {
    const normalizedStatus = status?.toLowerCase();
    return normalizedStatus === 'verified' || normalizedStatus === 'approved';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-4 h-4',
          image: 'w-2.5 h-2.5',
        };
      case 'lg':
        return {
          container: 'w-6 h-6',
          image: 'w-4 h-4',
        };
      case 'md':
      default:
        return {
          container: 'w-5 h-5',
          image: 'w-3 h-3',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (!isVerified()) {
    return null;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-blue-500 shadow-sm',
        sizeClasses.container,
        className,
      )}
    >
      <img src="/check.png" alt="Verified" className={cn('text-white', sizeClasses.image)} />
    </div>
  );
};
