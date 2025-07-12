import { AvatarImage } from '@radix-ui/react-avatar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Expert } from '@/types/types';

interface Appointment {
  expert: Expert;
  date: Date;
  time: string;
  status: 'confirmed' | 'pending';
}

interface AppointmentCardProps {
  expert: Expert;
  date: Date;
  time: string;
  status: 'confirmed' | 'pending';
  onReschedule?: () => void;
  onCancel?: () => void;
  allAppointments?: Appointment[];
  selectedDate?: Date;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  expert,
  date,
  time,
  status,
  onReschedule,
  onCancel,
  allAppointments = [],
  selectedDate,
}) => {
  const [dateAppointments, setDateAppointments] = useState<Appointment[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (selectedDate && allAppointments.length > 0) {
      const filtered = allAppointments.filter(
        (apt) =>
          apt.date.getDate() === selectedDate.getDate() &&
          apt.date.getMonth() === selectedDate.getMonth() &&
          apt.date.getFullYear() === selectedDate.getFullYear(),
      );

      setDateAppointments(filtered.length > 0 ? filtered : [{ expert, date, time, status }]);
      setCurrentIndex(0);
    } else {
      setDateAppointments([{ expert, date, time, status }]);
    }
  }, [selectedDate, allAppointments, expert, date, time, status]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < dateAppointments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentAppointment = dateAppointments[currentIndex] || { expert, date, time, status };
  const totalAppointments = dateAppointments.length;

  return (
    <div className="relative dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm space-y-4">
      {/* Booking counter at top-right */}
      <span className="absolute top-4 right-4 text-sm text-gray-500">
        {currentIndex + 1}/{totalAppointments}
      </span>

      {/* Side arrows */}
      {totalAppointments > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="absolute -left-6 top-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-gray-700 shadow p-2 border border-green-500 disabled:border-gray-300"
          >
            <ChevronLeft
              className={`h-5 w-5 ${currentIndex === 0 ? 'text-gray-400' : 'text-green-800'}`}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            disabled={currentIndex === totalAppointments - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-whitedark:bg-gray-700 shadow p-2 border border-green-500 disabled:border-gray-300"
          >
            <ChevronRight
              className={`h-5 w-5 ${
                currentIndex === totalAppointments - 1 ? 'text-gray-400' : 'text-green-500'
              }`}
            />
          </Button>
        </>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[16px]">
          <span className="font-semibold">Upcoming</span>{' '}
          <span className="text-green-500">Appointment</span>{' '}
        </span>
      </div>

      {/* Expert info */}
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12 rounded-full overflow-hidden">
          <AvatarImage
            src={`https://images.unsplash.com/photo-1607746882042-944635dfe10e?crop=faces&fit=crop&w=200&q=80`}
            className="w-full h-full object-cover"
          />
        </Avatar>
        <div className="flex-1">
          <h4 className="font-semibold text-lg">{currentAppointment.expert?.name}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentAppointment.expert?.specialty}
          </p>
          <div className="flex gap-1 text-yellow-400 mt-1">
            {'★'.repeat(currentAppointment.expert?.rating || 0)}
            {'☆'.repeat(5 - (currentAppointment.expert?.rating || 0))}
          </div>
        </div>
      </div>

      {/* Date, time, status */}
      <div className="space-y-3 py-4 border-y dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <span className="text-lg">📅</span>
          <p className="text-sm font-medium">
            {currentAppointment.date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <span className="text-lg">⏰</span>
          <p className="text-sm font-medium">{currentAppointment.time}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {currentAppointment.status}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => {
            if (onReschedule) onReschedule();
          }}
          className="flex-1 border-2 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Reschedule
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30"
          onClick={() => {
            if (onCancel) onCancel();
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
