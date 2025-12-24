'use client';

import { CheckCircle, ChevronLeft, ChevronRight, Gift, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useBookingStore } from '@/stores/bookingStore';
import type { Slot } from '@/types/slot';

interface ScheduleStepProps {
  therapistName?: string;
  slotsByDate: { [date: string]: Slot[] };
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
  totalDatePages,
  displayedDates,
  availableDates,
  loadingMoreSlots,
  isSlotReserved,
  onDateSelect,
  onTimeSelect,
  onDatePageChange,
  onLoadMore,
  formatDateForAPI,
}) => {
  const { selectedDate, selectedTime, datePage } = useBookingStore();
  const currentDatePage = Math.min(datePage, totalDatePages - 1);
  const datesPerPage = 6;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-poppins font-bold text-charcoal">Select a date & time</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-inter">
          Choose when you&apos;d like to meet with {therapistName}
        </p>
      </div>

      {/* Stamps Information Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Earn Stamps with Every Booking
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                Book appointments to earn stamps and unlock discounts on future sessions with this
                therapist!
              </p>
              <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1 list-disc list-inside">
                <li>
                  Earn 1 stamp for each completed appointment (stamps are awarded after your
                  therapist marks the appointment as completed)
                </li>
                <li>Reach 5 stamps to unlock a 15% discount reward</li>
                <li>
                  Discounts are automatically applied to your next booking with the same therapist
                </li>
                <li>Stamps are grouped separately for each therapist</li>
              </ul>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-3 font-medium">
                View your stamp progress in Account Settings → Stamps
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date and Time Selection */}
      <div className="space-y-8">
        {/* Date Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-poppins font-semibold text-charcoal">Select Date</h3>
            {totalDatePages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDatePageChange(Math.max(0, datePage - 1))}
                  disabled={datePage === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-500 min-w-[80px] text-center">
                  {currentDatePage + 1} / {totalDatePages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDatePageChange(Math.min(totalDatePages - 1, datePage + 1))}
                  disabled={datePage >= totalDatePages - 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {displayedDates?.map((date) => {
              const dateObj = new Date(date);
              const isToday = date === formatDateForAPI(new Date());
              const isSelected = selectedDate === date;
              const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNumber = dateObj.getDate();
              const month = dateObj.toLocaleDateString('en-US', { month: 'short' });

              return (
                <button
                  key={date}
                  className={`relative p-3 rounded-xl border ${
                    isSelected
                      ? 'border-primary bg-primary text-white shadow-md'
                      : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700'
                  }`}
                  onClick={() => onDateSelect(date)}
                >
                  <div className="text-center space-y-1">
                    <div
                      className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-500'}`}
                    >
                      {dayOfWeek}
                    </div>
                    <div
                      className={`text-lg font-poppins font-semibold ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}
                    >
                      {dayNumber}
                    </div>
                    <div
                      className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-500'}`}
                    >
                      {month}
                    </div>
                  </div>
                  {isToday && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div
                        className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Load more dates */}
          {availableDates.length > (currentDatePage + 1) * datesPerPage && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={loadingMoreSlots}
                className="px-8"
              >
                {loadingMoreSlots ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More Dates'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="space-y-4">
            <h3 className="text-lg font-poppins font-semibold text-charcoal">Available Times</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-80 overflow-y-auto">
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
                    className={`relative p-3 rounded-lg border-2 font-medium text-sm ${
                      isSelected
                        ? 'border-primary bg-primary text-white shadow-lg'
                        : isBooked
                          ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-60'
                          : isReservedByOthers
                            ? 'border-yellow-200 bg-yellow-50 text-yellow-600 cursor-not-allowed opacity-60'
                            : 'border-gray-200 bg-white text-gray-900 dark:bg-gray-800 dark:text-white'
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

            {selectedTime && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-900 dark:text-green-100">
                      Time Selected
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
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
                  <div className="ml-auto font-bold text-green-900 dark:text-green-100">
                    EUR{' '}
                    {slotsByDate[selectedDate]?.find((s) => s.id === selectedTime)?.basePrice || 0}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
