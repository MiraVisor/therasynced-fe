'use client';

import { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface GuidedEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
}

export const GuidedEmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  className,
}: GuidedEmptyStateProps) => {
  const handleAction = () => {
    if (onActionClick) {
      onActionClick();
    } else if (actionHref) {
      window.location.href = actionHref;
    }
  };

  return (
    <Card
      className={`border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl ${className || ''}`}
    >
      <CardContent className="p-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-poppins text-charcoal font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm font-inter text-muted-foreground mb-6 max-w-md mx-auto">
            {description}
          </p>
          {actionLabel && (actionHref || onActionClick) && (
            <Button variant="default" size="sm" onClick={handleAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
