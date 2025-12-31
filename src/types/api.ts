/**
 * API response types and DTOs
 */

export interface BackendResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    timestamp: string;
    path: string;
  };
}

export interface BackendProfileResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    profilePicture?: string;
    gender?: string;
    dob?: string;
    city?: string;
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    // Freelancer-specific fields
    mainJobTitle?: {
      id: string;
      name: string;
      description: string;
    };
    clinicAddress?: string;
    verificationStatus?: string;
    firstAidCertificateStatus?: string;
  };
  meta: {
    timestamp: string;
    path: string;
  };
}

export interface BackendAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      profilePicture?: string;
      isEmailVerified: boolean;
      isActive: boolean;
    };
    accessToken: string;
    refreshToken: string;
  };
  meta: {
    timestamp: string;
    path: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    timestamp: string;
    path: string;
  };
}

export interface BackendApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta: {
    timestamp: string;
    path: string;
  };
}

export interface PaginationDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  weekStart?: string;
  weekEnd?: string;
  name?: string;
}

export interface CloudinaryUploadResponse {
  url: string;
  publicId: string;
  success: boolean;
  error?: string;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    publicId: string;
  };
}

export interface UploadedFile {
  url: string;
  publicId: string;
  type: string;
  uploadedAt: string;
}
