import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Simple appointment calendar that matches the screenshot style
// and allows navigation between appointments

interface AppointmentCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  appointments?: {
    date: Date;
  }[];
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const AppointmentCalendar = ({
  selectedDate,
  onDateChange,
  appointments = [],
}: AppointmentCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [days, setDays] = useState<
    { date: Date; isSelected: boolean; hasAppointment: boolean; isCurrentMonth: boolean }[]
  >([]);

  // Get current month for display
  const currentMonthName = currentMonth.toLocaleString('default', { month: 'long' });

  // Generate calendar days
  useEffect(() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const daysArray = [];

    // Get start day offset (0 is Sunday in JS, but we want Monday as first day)
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    // Add previous month days
    for (let i = startOffset; i > 0; i--) {
      const prevDate = new Date(firstDay);
      prevDate.setDate(prevDate.getDate() - i);
      daysArray.push({
        date: prevDate,
        isSelected: isSameDay(prevDate, selectedDate),
        hasAppointment: hasAppointmentOn(prevDate),
        isCurrentMonth: false,
      });
    }

    // Add current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      daysArray.push({
        date: currentDate,
        isSelected: isSameDay(currentDate, selectedDate),
        hasAppointment: hasAppointmentOn(currentDate),
        isCurrentMonth: true,
      });
    }

    // Add next month days to fill the grid
    const remainingDays = 42 - daysArray.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(lastDay);
      nextDate.setDate(nextDate.getDate() + i);
      daysArray.push({
        date: nextDate,
        isSelected: isSameDay(nextDate, selectedDate),
        hasAppointment: hasAppointmentOn(nextDate),
        isCurrentMonth: false,
      });
    }

    setDays(daysArray);
  }, [currentMonth, selectedDate, appointments]);

  // Helper functions
  function isSameDay(d1: Date, d2: Date) {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  }

  function hasAppointmentOn(date: Date) {
    return appointments.some((apt) => isSameDay(apt.date, date));
  }

  function getPrevAppointment() {
    const sortedDates = [...appointments]
      .map((a) => a.date)
      .sort((a, b) => a.getTime() - b.getTime());

    const prevDate = sortedDates.find((d) => d.getTime() < selectedDate.getTime());

    if (prevDate) {
      onDateChange(prevDate);
      setCurrentMonth(new Date(prevDate.getFullYear(), prevDate.getMonth(), 1));
    }
  }

  function getNextAppointment() {
    const sortedDates = [...appointments]
      .map((a) => a.date)
      .sort((a, b) => a.getTime() - b.getTime());

    const nextDate = sortedDates.find((d) => d.getTime() > selectedDate.getTime());

    if (nextDate) {
      onDateChange(nextDate);
      setCurrentMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    }
  }

  return (
    <div className="rounded-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="flex justify-between items-center bg-green-700 text-white p-4">
        <button
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
          }
          className="p-1 rounded-full hover:bg-green-600 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-medium">{currentMonthName}</h2>
        <button
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
          }
          className="p-1 rounded-full hover:bg-green-600 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-700">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-gray-800 dark:text-gray-200"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => (
          <div
            key={i}
            onClick={() => onDateChange(day.date)}
            className={`
              p-2 text-center border border-gray-100 dark:border-gray-700 h-12 sm:h-12 lg:h-14
              relative cursor-pointer
              ${!day.isCurrentMonth ? 'text-gray-400 dark:text-gray-500' : ''}
              ${day.isSelected ? 'bg-green-100 dark:bg-green-900' : ''}
            `}
          >
            <span
              className={`
              flex items-center justify-center w-8 h-8 mx-auto rounded-full
              ${day.isSelected ? 'bg-green-500 text-white' : ''}
            `}
            >
              {day.date.getDate()}
            </span>

            {day.hasAppointment && (
              <div
                className={`
                absolute bottom-1 left-1/2 transform -translate-x-1/2
                w-1 h-1 rounded-full
                ${day.isSelected ? 'bg-white' : 'bg-green-500'}
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
          onClick={getPrevAppointment}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous Appointment
        </button>

        <button
          className="text-sm text-green-700 dark:text-green-300 hover:underline flex items-center"
          onClick={getNextAppointment}
        >
          Next Appointment
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
