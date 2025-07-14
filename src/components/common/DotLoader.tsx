import React from 'react';

interface DotLoaderProps {
  size?: number;
  color?: string;
  className?: string;
}

const DotLoader: React.FC<DotLoaderProps> = ({ size = 10, color = '#22c55e', className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-label="Loading">
      <span
        className="animate-bounce"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: '50%',
          display: 'inline-block',
          animationDelay: '0s',
        }}
      />
      <span
        className="animate-bounce"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: '50%',
          display: 'inline-block',
          animationDelay: '0.15s',
        }}
      />
      <span
        className="animate-bounce"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: '50%',
          display: 'inline-block',
          animationDelay: '0.3s',
        }}
      />
    </span>
  );
};

export default DotLoader;
