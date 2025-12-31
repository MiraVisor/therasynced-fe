/**
 * User profile and user-related types
 */

export interface UpdateProfileDto {
  name?: string;
  city?: string;
  gender?: string;
  dob?: string;
  description?: string; // Bio/description field
  // New fields for freelancers
  // Updated to match backend DTO
  mainJobTitleId?: string | null; // Allow null to clear selection
  clinicAddress?: string;
}
