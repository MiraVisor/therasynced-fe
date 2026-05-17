'use client';

import { ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useDeleteLocationPricing,
  useFreelancerPricing,
  useUpdateLocationPricing,
} from '@/hooks/queries/usePricing';
import { useProfile } from '@/hooks/queries/useProfile';
import { useServiceCategoriesByJobTitle } from '@/hooks/queries/useServiceCategories';
import type { LocationType, UpdateLocationPricingDto } from '@/types/pricing';

// All location types with display labels in the requested order
const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: 'CLINIC', label: 'Clinic-Based Session' },
  { value: 'HOME', label: 'Home Visit (Client Location)' },
  { value: 'CORPORATE', label: 'Corporate Wellness Session' },
  { value: 'GYM', label: 'Gym-Based Session' },
  { value: 'TRAINING', label: 'Training Session (Team or Individual)' },
  { value: 'PITCHSIDE', label: 'Pitch-Side / Game-Day Cover' },
  { value: 'EVENT', label: 'Sporting Event Coverage' },
];

type CategoryPricing = {
  [categoryId: string]: {
    [key in LocationType]?: number;
  };
};

export const ServicePricingSection = () => {
  const { data: profile } = useProfile();

  const { data: categories = [], isLoading: isLoadingCategories } = useServiceCategoriesByJobTitle(
    profile?.id ?? null,
  );
  const { data: pricing, isLoading: isLoadingPricing } = useFreelancerPricing();
  const { mutate: updatePricing, isPending: isSaving } = useUpdateLocationPricing();
  const { mutate: deletePricing, isPending: isDeleting } = useDeleteLocationPricing();

  const [locationPrices, setLocationPrices] = useState<CategoryPricing>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Initialize prices from API
  useEffect(() => {
    if (pricing?.servicePricing) {
      const prices: CategoryPricing = {};
      pricing.servicePricing.forEach((sp) => {
        const categoryId = sp.serviceId;
        prices[categoryId] = {};

        if (sp.locations && sp.locations.length > 0) {
          sp.locations.forEach((location) => {
            if (location?.locationType && location.price !== undefined) {
              prices[categoryId] = prices[categoryId] || {};
              prices[categoryId][location.locationType] = location.price;
            }
          });
        } else if (sp.price > 0) {
          prices[categoryId].CLINIC = sp.price;
        }
      });
      setLocationPrices(prices);
    }
  }, [pricing]);

  const handlePriceChange = (categoryId: string, locationType: LocationType, value: string) => {
    const price = value === '' ? 0 : parseFloat(value) || 0;
    setLocationPrices((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [locationType]: price > 0 ? price : undefined,
      },
    }));
  };

  const handleRemoveLocation = (categoryId: string, locationType: LocationType) => {
    deletePricing(
      { serviceCategoryId: categoryId, locationType: locationType as 'HOME' | 'CLINIC' },
      {
        onSuccess: () => {
          setLocationPrices((prev) => {
            const updated = { ...prev };
            if (updated[categoryId]) {
              const { [locationType]: _removed, ...rest } = updated[categoryId];
              updated[categoryId] = rest;
              if (Object.keys(updated[categoryId]).length === 0) {
                delete updated[categoryId];
              }
            }
            return updated;
          });
        },
      },
    );
  };

  const handleAddLocation = (categoryId: string, locationType: LocationType) => {
    setLocationPrices((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [locationType]: 0,
      },
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    const pricingUpdates: UpdateLocationPricingDto[] = [];

    Object.entries(locationPrices).forEach(([categoryId, locations]) => {
      Object.entries(locations).forEach(([locationType, price]) => {
        if (price && price > 0) {
          pricingUpdates.push({
            serviceCategoryId: categoryId,
            locationType: locationType as LocationType,
            price,
          });
        }
      });
    });

    if (pricingUpdates.length === 0) {
      return;
    }

    updatePricing(pricingUpdates);
  };

  const hasChanges = useMemo(() => {
    if (!pricing?.servicePricing) {
      return Object.keys(locationPrices).length > 0;
    }

    for (const sp of pricing.servicePricing) {
      const categoryId = sp.serviceId;
      const currentPrices = locationPrices[categoryId] || {};

      if (sp.locations && sp.locations.length > 0) {
        for (const location of sp.locations) {
          if (currentPrices[location.locationType] !== location.price) {
            return true;
          }
        }
        const apiLocationTypes = new Set(sp.locations.map((l) => l.locationType));
        const currentLocationTypes = new Set(Object.keys(currentPrices));
        if (apiLocationTypes.size !== currentLocationTypes.size) {
          return true;
        }
        for (const locType of Array.from(currentLocationTypes)) {
          if (!apiLocationTypes.has(locType as LocationType)) {
            return true;
          }
        }
      } else if (sp.price > 0) {
        if (currentPrices.CLINIC !== sp.price) {
          return true;
        }
        if (Object.keys(currentPrices).length > 1) {
          return true;
        }
      }
    }

    for (const [categoryId, prices] of Object.entries(locationPrices)) {
      const hasPrice = Object.values(prices).some((p) => p && p > 0);
      if (hasPrice && !pricing.servicePricing.find((sp) => sp.serviceId === categoryId)) {
        return true;
      }
    }

    return false;
  }, [locationPrices, pricing]);

  const getAvailableLocations = (categoryId: string) => {
    const usedLocations = new Set(Object.keys(locationPrices[categoryId] || {}));
    return LOCATION_TYPES.filter((lt) => !usedLocations.has(lt.value));
  };

  const getPricingSummary = (categoryId: string) => {
    const catPricing = locationPrices[categoryId] || {};
    const pricedLocations = Object.entries(catPricing)
      .filter(([_, price]) => price !== undefined && price > 0)
      .map(([loc, price]) => {
        const label = LOCATION_TYPES.find((lt) => lt.value === loc)?.label || loc;
        return `€${price} (${label.split(' ')[0]})`;
      });
    return pricedLocations.length > 0
      ? pricedLocations.slice(0, 2).join(', ') + (pricedLocations.length > 2 ? '...' : '')
      : '';
  };

  if (isLoadingCategories || isLoadingPricing || !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing</CardTitle>
          <CardDescription>Set prices for each service category you offer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="medium" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile?.id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing</CardTitle>
          <CardDescription>Set prices for each service category you offer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Please complete your profile first.</p>
            <p className="text-xs mt-2">Go to Account Settings to set up your profile.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categories.length === 0 && !isLoadingCategories) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing</CardTitle>
          <CardDescription>Set prices for each service category you offer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No service categories available.</p>
            <p className="text-xs mt-2">
              {profile?.mainJobTitle
                ? 'Please contact support if you believe this is an error.'
                : 'Please set your job title in your profile first.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Service Pricing</CardTitle>
            <CardDescription>
              Set location-based prices for {profile.mainJobTitle?.name || 'your'} service
              categories
            </CardDescription>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving} size="sm" className="h-9">
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length > 0 && categories[0]?.jobTitle && (
          <div className="mb-4 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Service Categories for:</span>
              <Badge variant="secondary" className="text-sm font-medium">
                {categories[0].jobTitle.name}
              </Badge>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {categories.map((category) => {
            const categoryPricing = locationPrices[category.id] || {};
            const configuredLocations = Object.entries(categoryPricing).filter(
              ([_, price]) => price !== undefined,
            );
            const isExpanded = expandedCategories.has(category.id);
            const availableLocations = getAvailableLocations(category.id);

            return (
              <div key={category.id} className="border rounded-lg bg-white overflow-hidden">
                <button
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex-1">
                    <Label className="text-sm font-semibold text-charcoal">{category.name}</Label>
                    {category.description && (
                      <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    {configuredLocations.length > 0 && (
                      <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {getPricingSummary(category.id)}
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 pt-2 border-t border-gray-200">
                    {/* Configured Locations */}
                    {configuredLocations.map(([locationType, price]) => {
                      const locationInfo = LOCATION_TYPES.find((lt) => lt.value === locationType);
                      return (
                        <div key={locationType} className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground min-w-[180px]">
                            {locationInfo?.label || locationType}:
                          </Label>
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm text-muted-foreground">EUR</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={price || ''}
                              onChange={(e) =>
                                handlePriceChange(
                                  category.id,
                                  locationType as LocationType,
                                  e.target.value,
                                )
                              }
                              className="w-32"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                handleRemoveLocation(category.id, locationType as LocationType)
                              }
                              disabled={isDeleting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add New Location */}
                    {availableLocations.length > 0 && (
                      <div className="flex items-center gap-2 pt-2">
                        <Select
                          onValueChange={(value) =>
                            handleAddLocation(category.id, value as LocationType)
                          }
                        >
                          <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Add location type..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableLocations.map((lt) => (
                              <SelectItem key={lt.value} value={lt.value}>
                                {lt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {categories.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Set location-based prices for each service category. Choose from clinic, home visit,
              corporate, gym, training, pitch-side, or event locations. Prices are in EUR.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
