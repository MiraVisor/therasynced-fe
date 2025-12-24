import { create } from 'zustand';

interface StampState {
  selectedTherapistId: string | null;
  setSelectedTherapistId: (id: string | null) => void;
}

export const useStampStore = create<StampState>((set) => ({
  selectedTherapistId: null,
  setSelectedTherapistId: (id) => set({ selectedTherapistId: id }),
}));
