import { create } from 'zustand';

interface SlotStatusInfo {
  status: 'AVAILABLE' | 'RESERVED' | 'BOOKED';
  isAvailable: boolean;
  isReserved: boolean;
  isBooked: boolean;
  canBeReserved: boolean;
  statusMessage: string;
}

interface SlotState {
  socketConnected: boolean;
  reservedSlots: string[];
  slotStatuses: { [slotId: string]: SlotStatusInfo };

  setSocketConnected: (connected: boolean) => void;
  updateSlotStatus: (slotId: string, statusInfo: SlotStatusInfo) => void;
  updateMultipleSlots: (updates: Array<{ slotId: string; statusInfo: SlotStatusInfo }>) => void;
  reserveSlot: (slotId: string) => void;
  releaseSlot: (slotId: string) => void;
  confirmSlotReservation: (slotId: string) => void;
  clearReservedSlots: () => void;
}

export const useSlotStore = create<SlotState>((set) => ({
  socketConnected: false,
  reservedSlots: [],
  slotStatuses: {},

  setSocketConnected: (connected) => set({ socketConnected: connected }),

  updateSlotStatus: (slotId, statusInfo) =>
    set((state) => ({
      slotStatuses: {
        ...state.slotStatuses,
        [slotId]: statusInfo,
      },
    })),

  updateMultipleSlots: (updates) =>
    set((state) => {
      const newStatuses = { ...state.slotStatuses };
      updates.forEach(({ slotId, statusInfo }) => {
        newStatuses[slotId] = statusInfo;
      });
      return { slotStatuses: newStatuses };
    }),

  reserveSlot: (slotId) =>
    set((state) => ({
      reservedSlots: state.reservedSlots.includes(slotId)
        ? state.reservedSlots
        : [...state.reservedSlots, slotId],
    })),

  releaseSlot: (slotId) =>
    set((state) => ({
      reservedSlots: state.reservedSlots.filter((id) => id !== slotId),
    })),

  confirmSlotReservation: (slotId) =>
    set((state) => ({
      reservedSlots: state.reservedSlots.includes(slotId)
        ? state.reservedSlots
        : [...state.reservedSlots, slotId],
    })),

  clearReservedSlots: () => set({ reservedSlots: [] }),
}));
