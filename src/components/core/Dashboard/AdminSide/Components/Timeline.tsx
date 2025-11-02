import { CheckCircle, Clock, XCircle } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'rejected';
  icon?: React.ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className }) => {
  const getStatusIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-error" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2',
                event.status === 'completed'
                  ? 'bg-success/10 border-success'
                  : event.status === 'rejected'
                    ? 'bg-error/10 border-error'
                    : 'bg-warning/10 border-warning',
              )}
            >
              {event.icon || getStatusIcon(event.status)}
            </div>
            {index < events.length - 1 && (
              <div className="w-0.5 h-full min-h-[40px] bg-border mt-2" />
            )}
          </div>
          <div className="flex-1 pb-8">
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-inter font-semibold text-sm text-foreground">{event.title}</h4>
              <span className="font-open-sans text-xs text-muted-foreground">
                {formatDate(event.timestamp)}
              </span>
            </div>
            {event.description && (
              <p className="font-open-sans text-sm text-muted-foreground mt-1">
                {event.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
