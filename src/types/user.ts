/**
 * User profile and user-related types
 */

export interface UpdateProfileDto {
  name?: string;
  city?: string;
  gender?: string;
  dob?: string;
  // New fields for freelancers
  // Updated to match backend DTO
  mainJobTitleId?: string;
  clinicAddress?: string;
}
