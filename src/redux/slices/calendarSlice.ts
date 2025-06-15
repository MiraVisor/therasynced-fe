import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { addDays, addMonths, addWeeks, subDays, subMonths, subWeeks } from 'date-fns';

import { AppointmentFilters, View } from '@/types/types';

interface CalendarState {
  selectedDate: Date;
  calendarView: View;
  filters: AppointmentFilters;
}

const initialState: CalendarState = {
  selectedDate: new Date(),
  calendarView: 'month',
  filters: {
    hideCompleted: false,
    hideCancelled: false,
    showOnlyUpcoming: false,
    showOnlyPast: false,
    selectedDate: new Date(),
  },
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<Date>) => {
      state.selectedDate = action.payload;
    },
    navigateToNext: (state) => {
      switch (state.calendarView) {
        case 'month':
          state.selectedDate = addMonths(state.selectedDate, 1);
          break;
        case 'week':
          state.selectedDate = addWeeks(state.selectedDate, 1);
          break;
        case 'day':
          state.selectedDate = addDays(state.selectedDate, 1);
          break;
      }
    },
    navigateToPrev: (state) => {
      switch (state.calendarView) {
        case 'month':
          state.selectedDate = subMonths(state.selectedDate, 1);
          break;
        case 'week':
          state.selectedDate = subWeeks(state.selectedDate, 1);
          break;
        case 'day':
          state.selectedDate = subDays(state.selectedDate, 1);
          break;
      }
    },
    navigateToToday: (state) => {
      state.selectedDate = new Date();
    },
    setCalendarView: (state, action: PayloadAction<View>) => {
      state.calendarView = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<CalendarState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
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
} = calendarSlice.actions;

export default calendarSlice.reducer;
