'use client';

import { format } from 'date-fns';
import { CheckCircle, Clock } from 'lucide-react';
import { useMemo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAvailableSlots } from '@/hooks/queries/useSlots';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/bookingStore';
import { Expert } from '@/types/types';

interface SlotSelectionStepProps {
  freelancer: Expert;
  selectedDate: string;
  onSlotSelect: (slotId: string) => void;
}

export const SlotSelectionStep: React.FC<SlotSelectionStepProps> = ({
  freelancer,
  selectedDate,
  onSlotSelect,
}) => {
  const { selectedTime, setSelectedTime } = useBookingStore();
  const { data: slots = [], isLoading } = useAvailableSlots(freelancer.id);

  // Filter slots for selected date and group by time of day
  const { morningSlots, afternoonSlots, eveningSlots } = useMemo(() => {
    const morning: typeof slots = [];
    const afternoon: typeof slots = [];
    const evening: typeof slots = [];

    slots.forEach((slot) => {
      const slotDate = format(new Date(slot.startTime), 'yyyy-MM-dd');
      if (slotDate === selectedDate && slot.status === 'AVAILABLE') {
        const hour = new Date(slot.startTime).getHours();
        if (hour < 12) {
          morning.push(slot);
        } else if (hour < 17) {
          afternoon.push(slot);
        } else {
          evening.push(slot);
        }
      }
    });

    // Sort each group by time
    const sortByTime = (a: (typeof slots)[0], b: (typeof slots)[0]) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime();

    return {
      morningSlots: morning.sort(sortByTime),
      afternoonSlots: afternoon.sort(sortByTime),
      eveningSlots: evening.sort(sortByTime),
    };
  }, [slots, selectedDate]);

  const selectedSlot = slots.find((s) => s.id === selectedTime);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalSlots = morningSlots.length + afternoonSlots.length + eveningSlots.length;

  return (
    <div className="space-y-6">
      {/* Freelancer Info */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <Avatar className="w-16 h-16">
          <AvatarImage src={freelancer.profilePicture || undefined} />
          <AvatarFallback className="bg-primary text-white text-lg">
            {freelancer.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-poppins font-semibold text-lg text-charcoal">
            {freelancer.name}
          </h3>
          <p className="text-sm text-gray-600">
            {format(new Date(`${selectedDate}T00:00:00`), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Time Slots */}
      {totalSlots === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-poppins font-semibold text-charcoal mb-2">
            No available times
          </h3>
          <p className="font-inter text-muted-foreground">
            There are no available slots for this date. Please select a different date.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {morningSlots.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Morning
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {morningSlots.map((slot) => (
                  <SlotButton
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedTime === slot.id}
                    onSelect={(slotId) => {
                      setSelectedTime(slotId);
                      onSlotSelect(slotId);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {afternoonSlots.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Afternoon
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {afternoonSlots.map((slot) => (
                  <SlotButton
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedTime === slot.id}
                    onSelect={(slotId) => {
                      setSelectedTime(slotId);
                      onSlotSelect(slotId);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {eveningSlots.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Evening
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {eveningSlots.map((slot) => (
                  <SlotButton
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedTime === slot.id}
                    onSelect={(slotId) => {
                      setSelectedTime(slotId);
                      onSlotSelect(slotId);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Slot Summary */}
      {selectedSlot && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-green-900">Time Selected</div>
              <div className="text-sm text-green-700">
                {format(new Date(selectedSlot.startTime), 'h:mm a')} -{' '}
                {format(new Date(selectedSlot.endTime), 'h:mm a')}
              </div>
            </div>
            <div className="ml-auto font-bold text-green-900 whitespace-nowrap">
              €{selectedSlot.basePrice}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SlotButton: React.FC<{
  slot: { id: string; startTime: string; endTime: string; basePrice: number };
  isSelected: boolean;
  onSelect: (slotId: string) => void;
}> = ({ slot, isSelected, onSelect }) => {
  const time = format(new Date(slot.startTime), 'h:mm a');

  const handleClick = () => {
    onSelect(slot.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'p-3 rounded-lg border-2 font-medium text-sm transition-all',
        isSelected
          ? 'border-primary bg-primary text-white shadow-lg'
          : 'border-gray-200 bg-white text-gray-900 hover:border-primary hover:bg-primary/5   ',
      )}
    >
      <div className="text-center">
        <div>{time}</div>
        {isSelected && <div className="text-xs mt-1 opacity-90">Selected</div>}
      </div>
    </button>
  );
};
