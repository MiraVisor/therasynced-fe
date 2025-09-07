// Utility functions for slot management

export const isSlotAvailable = (slot: any): boolean => {
  if (!slot) return false;

  // Check for new statusInfo structure first
  if (slot.statusInfo) {
    return slot.statusInfo.isAvailable === true;
  }

  // Check if explicitly booked
  if (slot.status === 'BOOKED' || slot.booking !== null || slot.isBooked === true) {
    return false;
  }

  // Check if reserved by others (but not by current user)
  if (slot.status === 'RESERVED') {
    return false; // For safety, treat reserved as unavailable
  }

  // Consider available if status is AVAILABLE or not explicitly blocked
  return (
    slot.status === 'AVAILABLE' || slot.status === 'available' || (!slot.isBooked && !slot.booking)
  );
};

// Helper function to format date safely without timezone issues
const formatDateForAPI = (date: Date): string => {
  return (
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0')
  );
};

export const groupSlotsByDate = (slots: any[]): { [date: string]: any[] } => {
  const slotsByDate: { [date: string]: any[] } = {};

  slots?.forEach((slot: any) => {
    if (isSlotAvailable(slot)) {
      const date = formatDateForAPI(new Date(slot.startTime));
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

export const getAvailableDates = (slots: any[]): string[] => {
  const slotsByDate = groupSlotsByDate(slots);
  return Object.keys(slotsByDate).sort();
};

export const paginateDates = (dates: string[], page: number, perPage: number) => {
  const startIndex = page * perPage;
  const endIndex = startIndex + perPage;
  return dates.slice(startIndex, endIndex);
};
