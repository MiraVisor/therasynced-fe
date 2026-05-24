/**
 * Pricing-related types
 */
import { LocationType } from './enums';

export { LocationType };

export interface LocationPricing {
  locationType: LocationType;
  price: number;
  currency?: string; // Default: EUR
}

export interface ServicePricing {
  serviceId: string;
  serviceName: string;
  price: number; // Legacy field for backward compatibility
  currency?: string; // Default: EUR
  // New location-based structure
  locations?: LocationPricing[];
}

export interface DurationPricing {
  duration: number; // minutes (30, 60, 90, 120, etc.)
  price: number;
  currency?: string; // Default: EUR
}

export type PitchsideSport = 'GAA' | 'Soccer' | 'Rugby' | 'Other';

export interface PitchsidePricing {
  id?: string;
  sport: PitchsideSport;
  sportOther?: string; // Required when sport = 'Other'
  price: number;
  currency?: string;
}

export interface FreelancerPricing {
  servicePricing: ServicePricing[];
  durationPricing: DurationPricing[];
  pitchsidePricing?: PitchsidePricing[];
}

export interface UpdateServicePricingDto {
  serviceCategoryId: string; // Service Category ID (matches API request)
  price: number; // Legacy field for backward compatibility
}

export interface UpdateLocationPricingDto {
  serviceCategoryId: string;
  locationType: LocationType;
  price: number; // Must be > 0
}

export interface UpdateDurationPricingDto {
  duration: number;
  price: number;
}

export interface UpdateServicePricingRequest {
  pricing: UpdateServicePricingDto[];
}

export interface UpdateLocationPricingRequest {
  pricing: UpdateLocationPricingDto[];
}

export interface UpdateDurationPricingRequest {
  pricing: UpdateDurationPricingDto[];
}

export interface UpdatePitchsidePricingDto {
  sport: PitchsideSport;
  sportOther?: string;
  price: number;
}

export interface UpdatePitchsidePricingRequest {
  pricing: UpdatePitchsidePricingDto[];
}
