// Utility functions for slot management

export const isSlotAvailable = (slot: any): boolean => {
  // Check for new statusInfo structure first
  if (slot.statusInfo) {
    return slot.statusInfo.isAvailable === true;
  }

  // Fallback to old structure for backward compatibility
  return (
    slot.status === 'AVAILABLE' ||
    slot.status === 'available' ||
    slot.isBooked === false ||
    slot.isBooked === null ||
    slot.isBooked === undefined ||
    slot.booked === false ||
    slot.booked === null ||
    slot.booked === undefined
  );
};

export const groupSlotsByDate = (slots: any[]): { [date: string]: any[] } => {
  const slotsByDate: { [date: string]: any[] } = {};

  slots?.forEach((slot: any) => {
    if (isSlotAvailable(slot)) {
      const date = new Date(slot.startTime).toISOString().split('T')[0];
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
  const isToday = date === new Date().toISOString().split('T')[0];

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
