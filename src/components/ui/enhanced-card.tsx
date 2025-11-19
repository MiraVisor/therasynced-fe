import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const enhancedCardVariants = cva('rounded-2xl border bg-white/80 backdrop-blur-sm', {
  variants: {
    variant: {
      default: 'border-gray-200/80 shadow-soft',
      primary: 'border-primary/20 shadow-soft bg-gradient-to-br from-primary/5 to-white',
      success: 'border-success/20 shadow-soft bg-gradient-to-br from-success/5 to-white',
      info: 'border-info/20 shadow-soft bg-gradient-to-br from-info/5 to-white',
      warning: 'border-warning/20 shadow-soft bg-gradient-to-br from-warning/5 to-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof enhancedCardVariants> {
  interactive?: boolean;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant, interactive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          enhancedCardVariants({ variant }),
          interactive && 'cursor-pointer',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

EnhancedCard.displayName = 'EnhancedCard';

export { EnhancedCard, enhancedCardVariants };
