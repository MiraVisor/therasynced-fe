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
  useDeleteLocationPricing,
  useFreelancerPricing,
  useUpdateLocationPricing,
} from '@/hooks/queries/usePricing';
import { useProfile } from '@/hooks/queries/useProfile';
import { useServiceCategoriesByJobTitle } from '@/hooks/queries/useServiceCategories';
import type { LocationType, UpdateLocationPricingDto } from '@/types/pricing';

type CategoryPricing = {
  [categoryId: string]: {
    HOME?: number;
    CLINIC?: number;
  };
};

export const ServicePricingSection = () => {
  const { data: profile } = useProfile();

  // Use freelancer ID instead of job title enum
  const { data: categories = [], isLoading: isLoadingCategories } = useServiceCategoriesByJobTitle(
    profile?.id ?? null,
  );
  const { data: pricing, isLoading: isLoadingPricing } = useFreelancerPricing();
  const { mutate: updatePricing, isPending: isSaving } = useUpdateLocationPricing();
  const { mutate: deletePricing, isPending: isDeleting } = useDeleteLocationPricing();

  // Local state for location-based prices
  const [locationPrices, setLocationPrices] = useState<CategoryPricing>({});

  // State for expanded/collapsed categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Initialize prices from API - serviceId in response is actually categoryId
  useEffect(() => {
    if (pricing?.servicePricing) {
      const prices: CategoryPricing = {};
      pricing.servicePricing.forEach((sp) => {
        // serviceId in response is actually the categoryId
        const categoryId = sp.serviceId;
        prices[categoryId] = {};

        // Use new location-based structure if available
        if (sp.locations && sp.locations.length > 0) {
          sp.locations.forEach((location) => {
            if (location?.locationType && location.price !== undefined) {
              prices[categoryId] = prices[categoryId] || {};
              prices[categoryId][location.locationType] = location.price;
            }
          });
        } else if (sp.price > 0) {
          // Fallback to legacy single price - default to CLINIC
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
    // Call the delete API endpoint
    deletePricing(
      { serviceCategoryId: categoryId, locationType },
      {
        onSuccess: () => {
          // Update local state after successful deletion
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

    // Check if any prices have changed
    for (const sp of pricing.servicePricing) {
      const categoryId = sp.serviceId;
      const currentPrices = locationPrices[categoryId] || {};

      // Check new location-based structure
      if (sp.locations && sp.locations.length > 0) {
        for (const location of sp.locations) {
          if (currentPrices[location.locationType] !== location.price) {
            return true;
          }
        }
        // Check if any locations were removed
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
        // Legacy single price - check if CLINIC price changed or new locations added
        if (currentPrices.CLINIC !== sp.price) {
          return true;
        }
        if (currentPrices.HOME !== undefined) {
          return true; // New location added
        }
      }
    }

    // Check for new categories with prices
    for (const [categoryId, prices] of Object.entries(locationPrices)) {
      const hasPrice = Object.values(prices).some((p) => p && p > 0);
      if (hasPrice && !pricing.servicePricing.find((sp) => sp.serviceId === categoryId)) {
        return true;
      }
    }

    return false;
  }, [locationPrices, pricing]);

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
        {/* Job Title Label */}
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
            const hasHome = categoryPricing.HOME !== undefined;
            const hasClinic = categoryPricing.CLINIC !== undefined;
            const isExpanded = expandedCategories.has(category.id);

            return (
              <div key={category.id} className="border rounded-lg bg-white overflow-hidden">
                {/* Collapsible Header */}
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
                    {/* Show pricing summary if any prices are set */}
                    {(hasHome || hasClinic) && (
                      <div className="text-xs text-muted-foreground">
                        {hasHome && hasClinic
                          ? `€${categoryPricing.HOME || 0} / €${categoryPricing.CLINIC || 0}`
                          : hasHome
                            ? `€${categoryPricing.HOME || 0} (Home)`
                            : `€${categoryPricing.CLINIC || 0} (Clinic)`}
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </button>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 pt-2 border-t border-gray-200">
                    {/* Location-based pricing */}
                    <div className="space-y-2">
                      {/* HOME Location */}
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground w-20">Home Visit:</Label>
                        {hasHome ? (
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm text-muted-foreground">EUR</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={categoryPricing.HOME || ''}
                              onChange={(e) =>
                                handlePriceChange(category.id, 'HOME', e.target.value)
                              }
                              className="w-32"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleRemoveLocation(category.id, 'HOME')}
                              disabled={isDeleting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddLocation(category.id, 'HOME')}
                            className="text-xs"
                          >
                            Add Home Visit Price
                          </Button>
                        )}
                      </div>

                      {/* CLINIC Location */}
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground w-20">Clinic:</Label>
                        {hasClinic ? (
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm text-muted-foreground">EUR</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={categoryPricing.CLINIC || ''}
                              onChange={(e) =>
                                handlePriceChange(category.id, 'CLINIC', e.target.value)
                              }
                              className="w-32"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleRemoveLocation(category.id, 'CLINIC')}
                              disabled={isDeleting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddLocation(category.id, 'CLINIC')}
                            className="text-xs"
                          >
                            Add Clinic Price
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {categories.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Set location-based prices for each service category. You can set prices for Home Visit
              and/or Clinic locations. Prices are in EUR. Remove a location by clicking the X
              button.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
