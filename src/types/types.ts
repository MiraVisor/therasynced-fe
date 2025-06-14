export interface registerUserTypes {
  name: string;
  email: string;
  role: string;
  password: string;
  profilePicture?: string;
  gender: string;
  dob: string;
  city: string;
}
export interface Expert {
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  description: string;
  isFavorite?: boolean;
}
export type RoleType = 'PATIENT' | 'FREELANCER' | 'ADMIN';

export enum ROLES {
  PATIENT = 'PATIENT',
  FREELANCER = 'FREELANCER',
  ADMIN = 'ADMIN',
}
