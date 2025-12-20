/**
 * Service-related types
 */
import type { LocationType } from './enums';

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  tags?: string[];
  isActive: boolean;
  locationTypes: LocationType[];
  requiresEquipment?: boolean;
  freelancerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  duration?: number;
  locationTypes: LocationType[];
  tags?: string[];
  requiresEquipment?: boolean;
}
