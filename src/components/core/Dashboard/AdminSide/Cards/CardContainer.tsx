import React, { ReactNode } from 'react';

import { EnhancedCard } from '@/components/ui/enhanced-card';
import { cn } from '@/lib/utils';

interface CardContainerProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const CardContainer: React.FC<CardContainerProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <EnhancedCard variant="default" className={cn('p-6', className)}>
      <h3 className="font-poppins text-lg font-semibold text-foreground mb-4 border-b border-border pb-3">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </EnhancedCard>
  );
};
