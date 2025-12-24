// Utility functions for slot management
import type { Slot } from '@/types/slot';

interface SlotWithStatusInfo extends Slot {
  statusInfo?: {
    isAvailable: boolean;
    isReserved: boolean;
    isBooked: boolean;
  };
  isBooked?: boolean;
}

export const isSlotAvailable = (slot: Slot | null | undefined): boolean => {
  if (!slot) return false;

  const slotWithInfo = slot as SlotWithStatusInfo;

  // Check for new statusInfo structure first
  if (slotWithInfo.statusInfo) {
    return slotWithInfo.statusInfo.isAvailable === true;
  }

  // Check if explicitly booked
  if (slot.status === 'BOOKED' || slot.booking !== null || slotWithInfo.isBooked === true) {
    return false;
  }

  // Check if reserved by others (but not by current user)
  if (slot.status === 'RESERVED') {
    // For safety, treat reserved as unavailable
    return false;
  }

  // Consider available if status is AVAILABLE or not explicitly blocked
  return slot.status === 'AVAILABLE' || (!slotWithInfo.isBooked && !slot.booking);
};

// Helper function to format date safely without timezone issues
const formatDateForAPI = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
};

export const groupSlotsByDate = (slots: Slot[]): { [date: string]: Slot[] } => {
  const slotsByDate: { [date: string]: Slot[] } = {};

  slots?.forEach((slot: Slot) => {
    if (isSlotAvailable(slot)) {
      const startTime =
        typeof slot.startTime === 'string' ? slot.startTime : String(slot.startTime);
      const date = formatDateForAPI(new Date(startTime));
      if (!slotsByDate[date]) slotsByDate[date] = [];
      slotsByDate[date].push(slot);
    }
  });

  return slotsByDate;
};

export const formatSlotTime = (startTime: string): string => {
  return new Date(startTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatSlotDate = (date: string): string => {
  const dateObj = new Date(date);
  const isToday = date === formatDateForAPI(new Date());

  if (isToday) {
    return 'Today';
  }

  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const getAvailableDates = (slots: Slot[]): string[] => {
  const slotsByDate = groupSlotsByDate(slots);
  return Object.keys(slotsByDate).sort();
};

export const paginateDates = (dates: string[], page: number, perPage: number) => {
  const startIndex = page * perPage;
  const endIndex = startIndex + perPage;
  return dates.slice(startIndex, endIndex);
};
