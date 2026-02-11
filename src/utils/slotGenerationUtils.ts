import { eachDayOfInterval, endOfWeek, isSameDay, startOfWeek } from 'date-fns';

import type { BlockedPeriod, DaySlotConfiguration, WeeklyAvailabilityTemplate } from '@/types/slot';

export interface GeneratedSlot {
  startTime: string; // ISO string
  endTime: string; // ISO string
}

/**
 * Calculate slot times for a given day based on start/end times, slot duration, and break duration
 */
function calculateSlotTimes(
  date: Date,
  startTime: string,
  endTime: string,
  slotDuration: number,
  breakDuration: number,
): GeneratedSlot[] {
  const slots: GeneratedSlot[] = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const dayStart = new Date(date);
  dayStart.setHours(startHour ?? 0, startMinute ?? 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(endHour ?? 0, endMinute ?? 0, 0, 0);

  let currentTime = new Date(dayStart);

  while (currentTime < dayEnd) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

    // Check if slot would exceed day end
    if (slotEnd > dayEnd) {
      break;
    }

    slots.push({
      startTime: slotStart.toISOString(),
      endTime: slotEnd.toISOString(),
    });

    // Move to next slot start time (slot duration + break duration)
    currentTime = new Date(slotEnd.getTime() + breakDuration * 60000);
  }

  return slots;
}

/**
 * Check if a slot overlaps with any blocked period
 */
function isSlotBlocked(slotStart: Date, slotEnd: Date, blockedPeriods: BlockedPeriod[]): boolean {
  return blockedPeriods.some((blocked) => {
    const blockedDate = new Date(blocked.date);
    blockedDate.setHours(0, 0, 0, 0);

    const slotDate = new Date(slotStart);
    slotDate.setHours(0, 0, 0, 0);

    // Check if blocked period is on the same day
    if (!isSameDay(blockedDate, slotDate)) {
      return false;
    }

    // Parse blocked period times
    const [blockedStartHour, blockedStartMinute] = blocked.startTime.split(':').map(Number);
    const [blockedEndHour, blockedEndMinute] = blocked.endTime.split(':').map(Number);

    const blockedStart = new Date(blockedDate);
    blockedStart.setHours(blockedStartHour ?? 0, blockedStartMinute ?? 0, 0, 0);

    const blockedEnd = new Date(blockedDate);
    blockedEnd.setHours(blockedEndHour ?? 0, blockedEndMinute ?? 0, 0, 0);

    // Check for overlap: slot overlaps if it starts before blocked ends and ends after blocked starts
    return slotStart < blockedEnd && slotEnd > blockedStart;
  });
}

/**
 * Get day of week index (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * Convert to Monday = 0, Tuesday = 1, ..., Sunday = 6
 */
function getDayOfWeekIndex(date: Date): number {
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return day === 0 ? 6 : day - 1; // Convert to Monday = 0, ..., Sunday = 6
}

/**
 * Get day configuration for a specific date
 */
function getDayConfig(date: Date, template: WeeklyAvailabilityTemplate) {
  const dayIndex = getDayOfWeekIndex(date);
  const dayNames = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const;
  return (
    template.days[dayNames[dayIndex] as keyof typeof template.days] ?? {
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
    }
  );
}

/**
 * Generate slots from weekly availability template for the current week
 */
export function generateSlotsFromTemplate(
  template: WeeklyAvailabilityTemplate,
  weekStart: Date = startOfWeek(new Date(), { weekStartsOn: 1 }),
): GeneratedSlot[] {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const allSlots: GeneratedSlot[] = [];

  weekDays.forEach((date) => {
    const dayConfig = getDayConfig(date, template);

    if (!dayConfig.enabled) {
      return;
    }

    const daySlots = calculateSlotTimes(
      date,
      dayConfig.startTime,
      dayConfig.endTime,
      template.slotDuration,
      template.breakDuration,
    );

    // Filter out slots that overlap with blocked periods
    const validSlots = daySlots.filter((slot) => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      return !isSlotBlocked(slotStart, slotEnd, template.blockedPeriods);
    });

    allSlots.push(...validSlots);
  });

  return allSlots;
}

/**
 * Check if a slot overlaps with a break time range
 */
function isSlotInBreakTime(
  slotStart: Date,
  slotEnd: Date,
  breakFrom: string,
  breakTill: string,
): boolean {
  if (!breakFrom || !breakTill) return false;

  const [breakStartHour, breakStartMinute] = breakFrom.split(':').map(Number);
  const [breakEndHour, breakEndMinute] = breakTill.split(':').map(Number);

  const slotDate = new Date(slotStart);
  slotDate.setHours(0, 0, 0, 0);

  const breakStart = new Date(slotDate);
  breakStart.setHours(breakStartHour ?? 0, breakStartMinute ?? 0, 0, 0);

  const breakEnd = new Date(slotDate);
  breakEnd.setHours(breakEndHour ?? 0, breakEndMinute ?? 0, 0, 0);

  // Check if slot overlaps with break time
  return slotStart < breakEnd && slotEnd > breakStart;
}

/**
 * Calculate slot times for a day with per-day configuration (including break time range)
 */
function calculateSlotTimesWithBreakRange(
  date: Date,
  config: DaySlotConfiguration,
): GeneratedSlot[] {
  const slots: GeneratedSlot[] = [];
  const [startHour, startMinute] = config.startTime.split(':').map(Number);
  const [endHour, endMinute] = config.endTime.split(':').map(Number);

  const dayStart = new Date(date);
  dayStart.setHours(startHour ?? 0, startMinute ?? 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(endHour ?? 0, endMinute ?? 0, 0, 0);

  let currentTime = new Date(dayStart);

  while (currentTime < dayEnd) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(slotStart.getTime() + config.slotDuration * 60000);

    // Check if slot would exceed day end
    if (slotEnd > dayEnd) {
      break;
    }

    // Skip slot if it overlaps with break time
    if (config.breakFrom && config.breakTill) {
      if (isSlotInBreakTime(slotStart, slotEnd, config.breakFrom, config.breakTill)) {
        // Move to after break time
        const [breakTillHour, breakTillMinute] = config.breakTill.split(':').map(Number);
        const breakTillTime = new Date(date);
        breakTillTime.setHours(breakTillHour ?? 0, breakTillMinute ?? 0, 0, 0);
        currentTime = new Date(breakTillTime);
        continue;
      }
    }

    slots.push({
      startTime: slotStart.toISOString(),
      endTime: slotEnd.toISOString(),
    });

    // Move to next slot start time (just add slot duration, no break duration needed)
    currentTime = new Date(slotEnd);
  }

  return slots;
}

/**
 * Generate slots from day configurations for a date range (defaults to 1 week)
 */
export function generateSlotsFromDayConfigurations(
  dayConfigurations: DaySlotConfiguration[],
  startDate: Date = startOfWeek(new Date(), { weekStartsOn: 1 }),
  endDate?: Date,
): GeneratedSlot[] {
  // Default to end of current week if endDate not provided (changed from 1 month)
  const finalEndDate = endDate || endOfWeek(startDate, { weekStartsOn: 1 });

  // Get all days in the date range directly (not by weeks)
  const allDays = eachDayOfInterval({ start: startDate, end: finalEndDate });

  const allSlots: GeneratedSlot[] = [];

  const dayNames = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const;

  // Generate slots for each day in the range
  allDays.forEach((date) => {
    const dayIndex = getDayOfWeekIndex(date);
    const dayName = dayNames[dayIndex];

    // Find configuration for this day
    const config = dayConfigurations.find((c) => c.day === dayName);
    if (!config) {
      return;
    }

    const daySlots = calculateSlotTimesWithBreakRange(date, config);
    allSlots.push(...daySlots);
  });

  return allSlots;
}

/**
 * Filter out slots that are in the past
 * @param slots Array of slots with startTime and endTime
 * @returns Array of slots that are in the future (start time must be greater than now)
 */
export function filterPastSlots<T extends { startTime: string; endTime: string }>(slots: T[]): T[] {
  const now = new Date();
  return slots.filter((slot) => {
    const slotStart = new Date(slot.startTime);
    // Allow slots that start at least 1 minute from now
    return slotStart.getTime() > now.getTime();
  });
}

/**
 * Filter out slots where the entire day is in the past
 * More lenient - allows future slots even if some today have passed
 * @param slots Array of slots with startTime and endTime
 * @returns Array of slots where the day is today or in the future
 */
export function filterPastDays<T extends { startTime: string; endTime: string }>(slots: T[]): T[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return slots.filter((slot) => {
    const slotDate = new Date(slot.startTime);
    slotDate.setHours(0, 0, 0, 0);
    return slotDate >= today;
  });
}
