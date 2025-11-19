import { format } from 'date-fns';
import { Building, CheckCircle2, Clock, Home } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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

  // Determine the effective status (use booking status if completed, otherwise slot status)
  const effectiveStatus =
    slot.booking?.status && slot.booking.status.toUpperCase() === 'COMPLETED'
      ? 'COMPLETED'
      : slot.status;

  const getStatusConfig = () => {
    switch (effectiveStatus) {
      case 'BOOKED':
        return {
          bgColor: 'bg-success/10',
          textColor: 'text-success',
          borderColor: 'border-success/30',
        };
      case 'COMPLETED':
        return {
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-300',
        };
      case 'AVAILABLE':
        return {
          bgColor: 'bg-info/10',
          textColor: 'text-info',
          borderColor: 'border-info/30',
        };
      case 'RESERVED':
        return {
          bgColor: 'bg-warning/10',
          textColor: 'text-warning',
          borderColor: 'border-warning/30',
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-muted-foreground',
          borderColor: 'border-gray-200',
        };
    }
  };

  const statusConfig = getStatusConfig();

  const locationIcon =
    slot.locationType === LocationType.HOME ? (
      <Home className="h-4 w-4" />
    ) : (
      <Building className="h-4 w-4" />
    );

  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer border-2',
        statusConfig.borderColor,
        isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
    >
      <div className="p-4">
        {/* Header with Status and Price */}
        <div className="flex items-center justify-between mb-3">
          <Badge
            variant={
              effectiveStatus === 'BOOKED' || effectiveStatus === 'COMPLETED'
                ? 'default'
                : 'outline'
            }
            className={cn(
              'text-xs font-poppins font-medium px-2.5 py-1',
              effectiveStatus === 'BOOKED' && 'bg-success/10 text-success border-success/20',
              effectiveStatus === 'COMPLETED' && 'bg-purple-100 text-purple-700 border-purple-200',
              effectiveStatus === 'AVAILABLE' && 'bg-info/10 text-info border-info/20',
              effectiveStatus === 'RESERVED' && 'bg-warning/10 text-warning border-warning/20',
            )}
          >
            {(effectiveStatus === 'BOOKED' || effectiveStatus === 'COMPLETED') && (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            )}
            {effectiveStatus}
          </Badge>
          <div className="text-right">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-lg font-poppins font-bold text-primary">
                EUR {slot.booking?.totalAmount?.toFixed(2) || slot.basePrice.toFixed(2)}
              </span>
            </div>
            {slot.booking?.discountAmount && slot.booking.discountAmount > 0 && (
              <div className="text-xs text-green-600 font-medium">
                -{slot.booking.discountPercentage}%
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-start gap-3">
          {/* Time */}
          <div className="flex flex-col items-center justify-center bg-primary/5 rounded-lg p-3 min-w-[70px] border border-primary/10">
            <div className="text-xl font-poppins font-bold text-primary">
              {format(slotDate, 'h:mm')}
            </div>
            <div className="text-[10px] font-inter font-medium text-primary/70 uppercase tracking-wide">
              {format(slotDate, 'a')}
            </div>
            <div className="text-[10px] font-inter text-muted-foreground mt-0.5">
              {slot.duration}min
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {(effectiveStatus === 'BOOKED' || effectiveStatus === 'COMPLETED') && client ? (
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 border border-primary/20 flex-shrink-0">
                  <AvatarFallback className="text-sm font-poppins font-semibold bg-primary/10 text-primary">
                    {client.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-poppins font-semibold text-base text-charcoal mb-1">
                    {client.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-inter text-muted-foreground">
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
                  <div className="p-1.5 rounded bg-info/10">
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

        {/* Notes Preview */}
        {slot.notes && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-inter text-muted-foreground line-clamp-2">{slot.notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
