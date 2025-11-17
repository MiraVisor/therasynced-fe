import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
  backgroundColor?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className = '',
  color = '#007745',
  backgroundColor = '#E5E7EB',
}) => {
  // Normalize sizes
  const normalizedSize =
    size === 'sm' ? 'small' : size === 'md' ? 'medium' : size === 'lg' ? 'large' : size;

  const sizeClasses: Record<string, string> = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8',
  };

  return (
    <div role="status" className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[normalizedSize]} animate-spin rounded-full border-[3px]`}
        style={{
          borderColor: backgroundColor,
          borderTopColor: color,
          animation: 'loader 0.7s linear infinite',
        }}
      />
      <span className="sr-only">Loading...</span>

      <style jsx>{`
        @keyframes loader {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
