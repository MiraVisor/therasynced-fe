import * as React from 'react';

import { cn } from '@/lib/utils';

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  greeting?: string;
  name?: string;
  subtitle?: string;
  quickStats?: Array<{
    label: string;
    value: string;
    icon?: React.ReactNode;
  }>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  greeting,
  name,
  subtitle,
  quickStats,
  className,
  ...props
}) => {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayGreeting = greeting || getTimeBasedGreeting();

  return (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-poppins font-bold text-foreground">
          {displayGreeting}
          {name && <span className="text-primary">, {name}</span>}
        </h1>
        {subtitle && <p className="text-base font-inter text-muted-foreground">{subtitle}</p>}
      </div>

      {/* Quick Stats */}
      {quickStats && quickStats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-mint/50 to-white rounded-xl p-4 border border-sage/30"
            >
              <div className="text-xs font-inter font-medium text-muted-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-xl font-poppins font-semibold text-foreground">{stat.value}</div>
              {stat.icon && <div className="mt-2">{stat.icon}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
