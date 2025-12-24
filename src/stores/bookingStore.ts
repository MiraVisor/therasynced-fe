import { create } from 'zustand';

import { ServiceCategory } from '@/types/common';

interface BookingState {
  // Step management
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Selection state
  selectedDate: string;
  selectedTime: string;
  datePage: number;
  setSelectedDate: (date: string) => void;
  setSelectedTime: (time: string) => void;
  setDatePage: (page: number) => void;

  // Services
  availableServices: ServiceCategory[];
  freelancerServices: ServiceCategory[];
  setAvailableServices: (services: ServiceCategory[]) => void;
  setFreelancerServices: (services: ServiceCategory[]) => void;

  // Reset
  resetBooking: () => void;
}

const initialState = {
  currentStep: 1,
  selectedDate: '',
  selectedTime: '',
  datePage: 0,
  availableServices: [],
  freelancerServices: [],
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setCurrentStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 3),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  setSelectedDate: (date) => set({ selectedDate: date }),

  setSelectedTime: (time) => set({ selectedTime: time }),

  setDatePage: (page) => set({ datePage: page }),

  setAvailableServices: (services) => set({ availableServices: services }),

  setFreelancerServices: (services) => set({ freelancerServices: services }),

  resetBooking: () => set(initialState),
}));
