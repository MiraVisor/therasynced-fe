import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { addDays, addMonths, addWeeks, subDays, subMonths, subWeeks } from 'date-fns';

import { Appointment, AppointmentFilters, View } from '@/types/types';

interface CalendarState {
  selectedDate: string; // Store as ISO string instead of Date object
  calendarView: View;
  filters: AppointmentFilters;
  selectedEvent: Appointment | null;
  isEventDialogOpen: boolean;
}

const initialState: CalendarState = {
  selectedDate: new Date().toISOString(), // Convert to ISO string
  calendarView: 'month',
  filters: {
    hideCompleted: false,
    hideCancelled: false,
    showOnlyUpcoming: false,
    showOnlyPast: false,
    selectedDate: new Date().toISOString(), // Convert to ISO string
  },
  selectedEvent: null,
  isEventDialogOpen: false,
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<Date>) => {
      state.selectedDate = action.payload.toISOString(); // Convert to ISO string
    },
    navigateToNext: (state) => {
      const currentDate = new Date(state.selectedDate);
      let newDate: Date;

      switch (state.calendarView) {
        case 'month':
          newDate = addMonths(currentDate, 1);
          break;
        case 'week':
          newDate = addWeeks(currentDate, 1);
          break;
        case 'day':
          newDate = addDays(currentDate, 1);
          break;
        default:
          newDate = currentDate;
      }

      state.selectedDate = newDate.toISOString(); // Convert to ISO string
    },
    navigateToPrev: (state) => {
      const currentDate = new Date(state.selectedDate);
      let newDate: Date;

      switch (state.calendarView) {
        case 'month':
          newDate = subMonths(currentDate, 1);
          break;
        case 'week':
          newDate = subWeeks(currentDate, 1);
          break;
        case 'day':
          newDate = subDays(currentDate, 1);
          break;
        default:
          newDate = currentDate;
      }

      state.selectedDate = newDate.toISOString(); // Convert to ISO string
    },
    navigateToToday: (state) => {
      state.selectedDate = new Date().toISOString(); // Convert to ISO string
    },
    setCalendarView: (state, action: PayloadAction<View>) => {
      state.calendarView = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<CalendarState['filters']>>) => {
      // Handle date conversion for selectedDate in filters
      const updatedFilters = { ...action.payload };
      if (
        updatedFilters.selectedDate &&
        typeof updatedFilters.selectedDate === 'object' &&
        'toISOString' in updatedFilters.selectedDate &&
        typeof (updatedFilters.selectedDate as any).toISOString === 'function'
      ) {
        updatedFilters.selectedDate = (updatedFilters.selectedDate as any).toISOString();
      }

      state.filters = { ...state.filters, ...updatedFilters };
    },
    setSelectedEvent: (state, action: PayloadAction<Appointment | null>) => {
      state.selectedEvent = action.payload;
      state.isEventDialogOpen = !!action.payload;
    },
    closeEventDialog: (state) => {
      state.selectedEvent = null;
      state.isEventDialogOpen = false;
    },
  },
});

export const {
  setSelectedDate,
  navigateToNext,
  navigateToPrev,
  navigateToToday,
  setCalendarView,
  setFilters,
  setSelectedEvent,
  closeEventDialog,
} = calendarSlice.actions;

export default calendarSlice.reducer;
