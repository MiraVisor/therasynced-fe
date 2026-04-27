'use client';

import { CheckCircle } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import { useBookingStore } from '@/stores/bookingStore';
import type { Slot } from '@/types/types';

interface ScheduleStepProps {
  therapistName?: string;
  slotsByDate: Record<string, Slot[]>;
  totalDatePages: number;
  displayedDates: string[];
  availableDates: string[];
  loadingMoreSlots: boolean;
  isSlotReserved: (slotId: string) => boolean;
  onDateSelect: (date: string) => void;
  onTimeSelect: (slotId: string) => void;
  onDatePageChange: (page: number) => void;
  onLoadMore: () => void;
  formatDateForAPI: (date: Date) => string;
}

export const ScheduleStep: React.FC<ScheduleStepProps> = ({
  therapistName,
  slotsByDate,
  availableDates,
  isSlotReserved,
  onDateSelect,
  onTimeSelect,
  formatDateForAPI,
}) => {
  const { selectedDate, selectedTime } = useBookingStore();

  // Convert selectedDate string to Date object for Calendar
  const selectedDateObj = selectedDate ? new Date(`${selectedDate}T00:00:00`) : undefined;

  // Get all dates that have available slots (availableDates are already formatted strings)
  const datesWithSlots = new Set(availableDates);

  // Handle date selection from Calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = formatDateForAPI(date);
      onDateSelect(dateString);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-poppins font-bold text-charcoal">Select a date & time</h1>
        <p className="text-gray-600 text-lg font-inter">
          Choose when you&apos;d like to meet with {therapistName}
        </p>
      </div>

      {/* Date and Time Selection - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-poppins font-semibold text-charcoal">Select Date</h3>
          <div className="border border-gray-200 rounded-lg p-4 bg-white"
            <Calendar
              mode="single"
              selected={selectedDateObj}
              onSelect={handleDateSelect}
              className="rounded-lg"
              disabled={(date: Date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dateToCheck = new Date(date);
                dateToCheck.setHours(0, 0, 0, 0);
                const dateString = formatDateForAPI(dateToCheck);
                // Disable dates that are in the past or don't have available slots
                return dateToCheck < today || !datesWithSlots.has(dateString);
              }}
              captionLayout="dropdown"
              fromYear={new Date().getFullYear()}
              toYear={new Date().getFullYear() + 1}
            />
          </div>
        </div>

        {/* Time Selection Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-poppins font-semibold text-charcoal">Available Times</h3>
          {selectedDate ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-white"
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {slotsByDate[selectedDate]?.map((slot) => {
                  const time = new Date(slot.startTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  });
                  const isSelected = selectedTime === slot.id;
                  const isReserved = isSlotReserved(slot.id);
                  const isReservedByOthers = slot.status === 'RESERVED' && !isReserved;
                  const isBooked = slot.status === 'BOOKED';

                  return (
                    <button
                      key={slot.id}
                      className={`relative p-3 rounded-lg border-2 font-medium text-sm transition-all ${
                        isSelected
                          ? 'border-primary bg-primary text-white shadow-lg'
                          : isBooked
                            ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-60'
                            : isReservedByOthers
                              ? 'border-yellow-200 bg-yellow-50 text-yellow-600 cursor-not-allowed opacity-60'
                              : 'border-gray-200 bg-white text-gray-900 hover:border-primary hover:bg-primary/5
                      }`}
                      onClick={() => {
                        if (!isReservedByOthers && !isBooked) {
                          onTimeSelect(slot.id);
                        }
                      }}
                      disabled={isReservedByOthers || isBooked}
                    >
                      <div className="text-center">
                        <div>{time}</div>
                        {isSelected && <div className="text-xs mt-1 opacity-90">Selected</div>}
                        {isBooked && <div className="text-xs mt-1">Booked</div>}
                        {isReservedByOthers && <div className="text-xs mt-1">Reserved</div>}
                      </div>
                      {selectedTime === slot.id && (
                        <div className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
              {(!slotsByDate[selectedDate] || slotsByDate[selectedDate].length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No available times for this date
                </div>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 bg-white text-center text-gray-500">
              Select a date to see available times
            </div>
          )}

          {/* Selected Time Summary */}
          {selectedTime && selectedDate && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-green-900"
                    Time Selected
                  </div>
                  <div className="text-sm text-green-700"
                    {(() => {
                      const selectedSlot = slotsByDate[selectedDate]?.find(
                        (s) => s.id === selectedTime,
                      );
                      if (!selectedSlot?.startTime) return '';
                      const date = new Date(selectedSlot.startTime);
                      return `${date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })} at ${date.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}`;
                    })()}
                  </div>
                </div>
                <div className="ml-auto font-bold text-green-900 whitespace-nowrap">
                  EUR{' '}
                  {slotsByDate[selectedDate]?.find((s) => s.id === selectedTime)?.basePrice || 0}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
