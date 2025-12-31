/**
 * Pricing-related types
 */

export interface ServicePricing {
  serviceId: string;
  serviceName: string;
  price: number;
  currency?: string; // Default: EUR
}

export interface DurationPricing {
  duration: number; // minutes (30, 60, 90, 120, etc.)
  price: number;
  currency?: string; // Default: EUR
}

export interface FreelancerPricing {
  servicePricing: ServicePricing[];
  durationPricing: DurationPricing[];
}

export interface UpdateServicePricingDto {
  serviceCategoryId: string; // Service Category ID (matches API request)
  price: number;
}

export interface UpdateDurationPricingDto {
  duration: number;
  price: number;
}

export interface UpdateServicePricingRequest {
  pricing: UpdateServicePricingDto[];
}

export interface UpdateDurationPricingRequest {
  pricing: UpdateDurationPricingDto[];
}
