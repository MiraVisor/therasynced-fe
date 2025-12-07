import { format } from 'date-fns';
import { Building, CheckCircle2, Clock, FileText, Home } from 'lucide-react';
import { useState } from 'react';

import { InvoiceGenerationDialog } from '@/components/core/Dashboard/FreelancerSide/Appointment/InvoiceGenerationDialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Appointment, LocationType, Slot } from '@/types/types';

interface SlotCardProps {
  slot: Slot;
  onClick?: () => void;
  isSelected?: boolean;
}

export const SlotCard: React.FC<SlotCardProps> = ({ slot, onClick, isSelected }) => {
  const slotDate = new Date(slot.startTime);
  const client = slot.booking?.client;
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

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

  // Convert slot to appointment format for invoice generation
  const convertSlotToAppointment = (): Appointment | null => {
    if (!slot.booking || !client) return null;

    return {
      id: slot.booking.id,
      title: `Session with ${client.name}`,
      start: slot.startTime,
      end: slot.endTime || slot.startTime,
      status: slot.booking.status as 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED',
      clientName: client.name,
      location: slot.locationType,
      notes: slot.booking.notes || slot.notes || '',
      locationType: slot.locationType,
      clientAddress: slot.locationType === LocationType.HOME ? slot.booking.clientAddress : null,
      freelancer: {
        clinicAddress: slot.location?.address || null,
      },
    };
  };

  const appointmentData = convertSlotToAppointment();

  const handleInvoiceClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from opening slot details
    setShowInvoiceDialog(true);
  };

  return (
    <>
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
                effectiveStatus === 'COMPLETED' &&
                  'bg-purple-100 text-purple-700 border-purple-200',
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

          {/* Invoice Button - Only for BOOKED or COMPLETED slots */}
          {(effectiveStatus === 'BOOKED' || effectiveStatus === 'COMPLETED') && slot.booking && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <Button
                onClick={handleInvoiceClick}
                variant="outline"
                size="sm"
                className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/10 hover:text-primary"
              >
                <FileText className="h-4 w-4" />
                Generate Invoice
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Invoice Generation Dialog */}
      {appointmentData && (
        <InvoiceGenerationDialog
          appointment={appointmentData}
          open={showInvoiceDialog}
          onOpenChange={setShowInvoiceDialog}
          initialPrice={slot.booking?.totalAmount || slot.basePrice}
        />
      )}
    </>
  );
};
