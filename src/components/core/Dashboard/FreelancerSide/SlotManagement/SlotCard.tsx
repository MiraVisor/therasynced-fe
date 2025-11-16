import { format } from 'date-fns';
import { AlertCircle, Building, CheckCircle2, Clock, DollarSign, Home } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { cn } from '@/lib/utils';
import { LocationType, Slot } from '@/types/types';

interface SlotCardProps {
  slot: Slot;
  onClick?: () => void;
  isSelected?: boolean;
}

export const SlotCard: React.FC<SlotCardProps> = ({ slot, onClick, isSelected }) => {
  const slotDate = new Date(slot.startTime);
  const client = slot.booking?.client;

  const getStatusVariant = () => {
    switch (slot.status) {
      case 'BOOKED':
        return 'success';
      case 'AVAILABLE':
        return 'primary';
      case 'RESERVED':
        return 'warning';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  const locationIcon =
    slot.locationType === LocationType.HOME ? (
      <Home className="h-4 w-4" />
    ) : (
      <Building className="h-4 w-4" />
    );

  return (
    <EnhancedCard
      variant={getStatusVariant()}
      interactive
      onClick={onClick}
      className={cn(
        'transition-all duration-300 hover:shadow-lg',
        isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
    >
      <div className="p-5">
        {/* Header with status badge */}
        <div className="flex items-center justify-between mb-4">
          <Badge
            variant={slot.status === 'BOOKED' ? 'default' : 'outline'}
            className={cn(
              'text-xs font-poppins font-medium',
              slot.status === 'BOOKED' && 'bg-success/10 text-success border-success/20',
              slot.status === 'AVAILABLE' && 'bg-info/10 text-info border-info/20',
              slot.status === 'RESERVED' && 'bg-warning/10 text-warning border-warning/20',
            )}
          >
            <span className="mr-1.5">
              {slot.status === 'BOOKED' && '✓'}
              {slot.status === 'AVAILABLE' && '○'}
              {slot.status === 'RESERVED' && '◐'}
            </span>
            {slot.status}
          </Badge>
          <div className="text-right">
            <div className="flex items-center gap-1 mb-0.5">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span className="text-lg font-poppins font-bold text-primary">
                €{slot.booking?.totalAmount?.toFixed(2) || slot.basePrice.toFixed(2)}
              </span>
            </div>
            {slot.booking?.discountAmount && slot.booking.discountAmount > 0 && (
              <div className="text-xs text-green-600 font-medium">
                -{slot.booking.discountPercentage}%
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex items-start gap-3">
          {/* Time badge */}
          <div className="flex flex-col items-center justify-center bg-primary/5 rounded-lg p-3 min-w-[60px] border border-primary/10">
            <div className="text-xl font-poppins font-bold text-primary">
              {format(slotDate, 'h:mm')}
            </div>
            <div className="text-[10px] font-inter text-muted-foreground mt-0.5">
              {slot.duration}min
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {slot.status === 'BOOKED' && client ? (
              <div className="flex items-start gap-3">
                <Avatar className="h-11 w-11 border-2 border-primary/20 flex-shrink-0 shadow-sm">
                  <AvatarFallback className="text-sm font-poppins font-semibold bg-primary/10 text-primary">
                    {client.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-poppins font-semibold text-base text-charcoal mb-1">
                    {client.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-inter text-muted-foreground">
                    {locationIcon}
                    <span className="truncate">
                      {slot.locationType === LocationType.HOME ? 'Home Visit' : 'Clinic'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-md bg-info/10">
                    <Clock className="h-3.5 w-3.5 text-info" />
                  </div>
                  <span className="font-poppins font-semibold text-sm text-charcoal">
                    Available for booking
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-inter text-muted-foreground mt-1">
                  {locationIcon}
                  <span>{slot.locationType === LocationType.HOME ? 'Home Visit' : 'Clinic'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Slot notes preview */}
        {slot.notes && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-inter text-muted-foreground line-clamp-2">{slot.notes}</p>
          </div>
        )}
      </div>
    </EnhancedCard>
  );
};
