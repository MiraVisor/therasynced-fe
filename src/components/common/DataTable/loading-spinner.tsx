interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

export function LoadingSpinner({ size = 'small' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8',
  };

  return (
    <div role="status">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-[3px] border-gray-200 border-t-primary`}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
