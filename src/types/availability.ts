/**
 * Availability and blocked days types
 */

export interface BlockedDate {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  reason?: string; // Optional reason for blocking
  createdAt: string;
  updatedAt: string;
}

export interface BlockDatesDto {
  dates: string[]; // Array of ISO date strings (YYYY-MM-DD)
  reason?: string; // Optional reason for blocking
}

export interface UnblockDatesDto {
  dates: string[]; // Array of ISO date strings to unblock
}

export interface BlockedDatesResponse {
  blockedDates: BlockedDate[];
}
