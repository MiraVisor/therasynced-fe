import { create } from 'zustand';

import { ServiceCategory } from '@/types/common';
import { LocationType } from '@/types/enums';

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

  // New booking flow state
  // Questionnaire answers
  preferredDate: Date | null;
  selectedServiceCategories: string[];
  bookingFor: 'myself' | 'someone-else';
  locationPreference: 'HOME' | 'CLINIC' | 'BOTH';
  freelancerSearchQuery: string;

  // Selected freelancer
  selectedFreelancerId: string | null;

  // Selected services
  selectedServiceIds: string[];

  // Selected location
  selectedLocationType: LocationType | null;
  clientAddress: string;

  // Setters
  setPreferredDate: (date: Date | null) => void;
  setSelectedServiceCategories: (categories: string[]) => void;
  setBookingFor: (forWhom: 'myself' | 'someone-else') => void;
  setLocationPreference: (preference: 'HOME' | 'CLINIC' | 'BOTH') => void;
  setFreelancerSearchQuery: (query: string) => void;
  setSelectedFreelancerId: (id: string | null) => void;
  setSelectedServiceIds: (ids: string[]) => void;
  setSelectedLocationType: (type: LocationType | null) => void;
  setClientAddress: (address: string) => void;

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
  // New booking flow initial state
  preferredDate: null,
  selectedServiceCategories: [],
  bookingFor: 'myself' as const,
  locationPreference: 'BOTH' as const,
  freelancerSearchQuery: '',
  selectedFreelancerId: null,
  selectedServiceIds: [],
  selectedLocationType: null,
  clientAddress: '',
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setCurrentStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 7),
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

  // New setters
  setPreferredDate: (date) => set({ preferredDate: date }),
  setSelectedServiceCategories: (categories) => set({ selectedServiceCategories: categories }),
  setBookingFor: (forWhom) => set({ bookingFor: forWhom }),
  setLocationPreference: (preference) => set({ locationPreference: preference }),
  setFreelancerSearchQuery: (query) => set({ freelancerSearchQuery: query }),
  setSelectedFreelancerId: (id) => set({ selectedFreelancerId: id }),
  setSelectedServiceIds: (ids) => set({ selectedServiceIds: ids }),
  setSelectedLocationType: (type) => set({ selectedLocationType: type }),
  setClientAddress: (address) => set({ clientAddress: address }),

  resetBooking: () => set(initialState),
}));
