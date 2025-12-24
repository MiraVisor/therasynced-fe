/**
 * Authentication and authorization types
 */
import type { JobTitle } from './freelancer';

export interface SignUpDto {
  name: string;
  email: string;
  role: string;
  password: string;
  profilePicture?: string;
  gender?: string;
  dob?: string;
  city?: string;
  // New optional fields for freelancers
  mainJobTitle?: JobTitle;
  clinicAddress?: string;
  firstAidCertificateUrl?: string;
  verificationDocuments?: string[];
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
