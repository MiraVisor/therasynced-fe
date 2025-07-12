import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface AppointmentDate {
  date: Date;
  hasAppointment: boolean;
}

interface AppointmentCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  appointments?: {
    date: Date;
  }[];
  highlightDates?: Date[];
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  selectedDate,
  onDateChange,
  appointments = [],
  highlightDates = [],
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(selectedDate));
  const [calendarDays, setCalendarDays] = useState<AppointmentDate[]>([]);

  // Get the month for header display
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });

  // Generate the days for the current month view
  useEffect(() => {
    const generateCalendarDays = () => {
      const days: AppointmentDate[] = [];
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
      const firstDayOfWeek = firstDayOfMonth.getDay();

      // Add days from the previous month to fill the first row
      // Adjust for Monday start
      const daysFromPreviousMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
      const lastDayOfPreviousMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        0,
      );

      for (let i = daysFromPreviousMonth; i > 0; i--) {
        const date = new Date(lastDayOfPreviousMonth);
        date.setDate(lastDayOfPreviousMonth.getDate() - i + 1);
        days.push({
          date,
          hasAppointment: hasAppointmentOnDate(date),
        });
      }

      // Add days from the current month
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        days.push({
          date,
          hasAppointment: hasAppointmentOnDate(date),
        });
      }

      // Add days from the next month to complete the grid (up to 42 days total for 6 rows)
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i);
        days.push({
          date,
          hasAppointment: hasAppointmentOnDate(date),
        });
      }

      return days;
    };

    setCalendarDays(generateCalendarDays());
  }, [currentMonth, appointments, highlightDates]);

  // Check if a date has an appointment
  const hasAppointmentOnDate = (date: Date): boolean => {
    // Check in appointments array
    const hasScheduled = appointments.some((appointment) => isSameDay(appointment.date, date));

    // Check in highlighted dates
    const isHighlighted = highlightDates.some((highlightDate) => isSameDay(highlightDate, date));

    return hasScheduled || isHighlighted;
  };

  // Helper to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Navigate to the previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to the next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Handle date selection
  const handleSelectDate = (day: AppointmentDate) => {
    onDateChange(day.date);
  };

  // Determine if a date is the currently selected date
  const isSelectedDate = (date: Date): boolean => {
    return isSameDay(date, selectedDate);
  };

  // Determine if a date is in the current month
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="flex justify-between items-center bg-green-700 text-white p-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 rounded-full hover:bg-green-600 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-medium">{monthName}</h2>
        <button
          onClick={goToNextMonth}
          className="p-1 rounded-full hover:bg-green-600 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-700">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-gray-800 dark:text-gray-200"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => handleSelectDate(day)}
            className={`
              p-2 text-center border border-gray-100 dark:border-gray-700 h-12 sm:h-12 lg:h-14
              relative cursor-pointer
              ${!isCurrentMonth(day.date) ? 'text-gray-400 dark:text-gray-500' : ''}
              ${isSelectedDate(day.date) ? 'bg-green-100 dark:bg-green-900' : ''}
            `}
          >
            <span
              className={`
              flex items-center justify-center w-8 h-8 mx-auto rounded-full
              ${isSelectedDate(day.date) ? 'bg-green-500 text-white' : ''}
            `}
            >
              {day.date.getDate()}
            </span>
            {day.hasAppointment && (
              <div
                className={`
                absolute bottom-1 left-1/2 transform -translate-x-1/2
                w-1 h-1 rounded-full
                ${isSelectedDate(day.date) ? 'bg-white' : 'bg-green-500'}
              `}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation for appointments */}
      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700">
        <button
          className="text-sm text-green-700 dark:text-green-300 hover:underline flex items-center"
          onClick={() => {
            // Find previous appointment date
            const sortedDates = appointments
              .map((a) => a.date)
              .sort((a, b) => a.getTime() - b.getTime());

            const prevDate = sortedDates
              .reverse()
              .find((date) => date.getTime() < selectedDate.getTime());
            if (prevDate) {
              onDateChange(prevDate);
              setCurrentMonth(new Date(prevDate.getFullYear(), prevDate.getMonth(), 1));
            }
          }}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous Appointment
        </button>
        <button
          className="text-sm text-green-700 dark:text-green-300 hover:underline flex items-center"
          onClick={() => {
            // Find next appointment date
            const sortedDates = appointments
              .map((a) => a.date)
              .sort((a, b) => a.getTime() - b.getTime());

            const nextDate = sortedDates.find((date) => date.getTime() > selectedDate.getTime());
            if (nextDate) {
              onDateChange(nextDate);
              setCurrentMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
            }
          }}
        >
          Next Appointment
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
