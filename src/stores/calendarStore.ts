import { create } from 'zustand';

import { Appointment, View } from '@/types/types';

interface CalendarFilters {
  hideCompleted: boolean;
  hideCancelled: boolean;
  showOnlyUpcoming: boolean;
  showOnlyPast: boolean;
}

interface CalendarState {
  selectedDate: Date;
  calendarView: View;
  filters: CalendarFilters;
  selectedEvent: Appointment | null;
  isEventDialogOpen: boolean;
  setSelectedDate: (date: Date) => void;
  setCalendarView: (view: View) => void;
  setFilters: (filters: Partial<CalendarFilters>) => void;
  setSelectedEvent: (event: Appointment | null) => void;
  setIsEventDialogOpen: (open: boolean) => void;
  navigateToPrev: () => void;
  navigateToNext: () => void;
  navigateToToday: () => void;
  closeEventDialog: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  selectedDate: new Date(),
  calendarView: 'month',
  filters: {
    hideCompleted: false,
    hideCancelled: false,
    showOnlyUpcoming: false,
    showOnlyPast: false,
  },
  selectedEvent: null,
  isEventDialogOpen: false,
  setSelectedDate: (date) => set({ selectedDate: date }),
  setCalendarView: (view) => set({ calendarView: view }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  setSelectedEvent: (event) => set({ selectedEvent: event, isEventDialogOpen: !!event }),
  setIsEventDialogOpen: (open) => set({ isEventDialogOpen: open }),
  navigateToPrev: () => {
    const { selectedDate, calendarView } = get();
    const newDate = new Date(selectedDate);
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    set({ selectedDate: newDate });
  },
  navigateToNext: () => {
    const { selectedDate, calendarView } = get();
    const newDate = new Date(selectedDate);
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    set({ selectedDate: newDate });
  },
  navigateToToday: () => set({ selectedDate: new Date() }),
  closeEventDialog: () => set({ isEventDialogOpen: false, selectedEvent: null }),
}));
