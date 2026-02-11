/**
 * Authentication and authorization types
 */

export interface SignUpDto {
  name: string;
  email: string;
  role: string;
  password?: string; // Optional for OAuth signups
  oauthSignupToken?: string; // Required when password is empty (OAuth signup)
  profilePicture?: string;
  gender?: string;
  dob?: string;
  county?: string;
  cityTown?: string;
  homeAddress?: string; // Home address for bookings (patients)
  // New optional fields for freelancers
  mainJobTitleId?: string;
  clinicAddress?: string;
  firstAidCertificateUrl?: string;
  verificationDocuments?: string[];
  // Consent fields
  termsConsent?: boolean;
  privacyConsent?: boolean;
  gdprConsent?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  newPassword: string;
}

export interface VerifyEmailLinkDto {
  token: string;
}

export interface GoogleSignInDto {
  idToken: string;
}

export interface ChangeEmailDto {
  newEmail: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Legacy type alias
export interface registerUserTypes extends SignUpDto {}
