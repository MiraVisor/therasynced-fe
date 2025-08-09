import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
  backgroundColor?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  color = '#000',
  backgroundColor = 'transparent',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const borderWidthClasses = {
    sm: 'border-2',
    md: 'border-4',
    lg: 'border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} ${borderWidthClasses[size]} rounded-full border-t-black border-l-black border-r-transparent border-b-transparent animate-spin`}
        style={{
          borderTopColor: color,
          borderLeftColor: color,
          borderRightColor: backgroundColor,
          borderBottomColor: backgroundColor,
          animation: 'loader 0.7s infinite linear',
        }}
      />

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
