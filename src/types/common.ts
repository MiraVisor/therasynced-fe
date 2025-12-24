// Helper types for common patterns
export type Timestamp = string; // ISO date string
export type UUID = string;
export type Currency = number;

// Error type utility
export type ErrorLike = Error | { message: string } | string;

/**
 * Safely extracts error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
}

// API response type
export type ApiError = {
  message: string;
  code?: number;
  status?: string;
  details?: unknown;
};

/**
 * Type guard to check if error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  );
}

/**
 * Extracts error message from API error response (handles axios error format)
 */
export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    // Handle axios error format: error.response.data.message
    if ('response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
      }
    }
    // Handle standard error format
    if ('message' in error) {
      return String(error.message);
    }
  }
  return getErrorMessage(error);
}

// Service Category interface
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  jobTitle?: {
    id: string;
    name: string;
  };
}

/**
 * Card info structure for freelancer display
 * Used in freelancer search results, cards, and listings
 */
export interface CardInfo {
  name: string;
  title?: string;
  mainService?: string;
  yearsOfExperience?: string;
  country?: string;
  averageRating?: number; // Can be undefined if no ratings
  totalRatings: number; // Always present (0 if no ratings) - backend returns 0 if no ratings
  patientStories?: number; // Legacy field, use totalRatings instead
  initials?: string;
}
