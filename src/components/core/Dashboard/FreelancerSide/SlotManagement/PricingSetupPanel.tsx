'use client';

import { AlertCircle, ArrowRight, Check, ChevronDown, ChevronUp, Plus, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useFreelancerPricing,
  useUpdateDurationPricing,
  useUpdateLocationPricing,
} from '@/hooks/queries/usePricing';
import { useProfile } from '@/hooks/queries/useProfile';
import { useServiceCategoriesByJobTitle } from '@/hooks/queries/useServiceCategories';
import type { LocationType, UpdateLocationPricingDto } from '@/types/pricing';

// All location types with display labels
const LOCATION_TYPES: { value: LocationType; label: string; shortLabel: string }[] = [
  { value: 'CLINIC', label: 'Clinic-Based Session', shortLabel: 'Clinic' },
  { value: 'HOME', label: 'Home Visit (Client Location)', shortLabel: 'Home' },
  { value: 'CORPORATE', label: 'Corporate Wellness Session', shortLabel: 'Corporate' },
  { value: 'GYM', label: 'Gym-Based Session', shortLabel: 'Gym' },
  { value: 'TRAINING', label: 'Training Session (Team or Individual)', shortLabel: 'Training' },
  { value: 'PITCHSIDE', label: 'Pitch-Side / Game-Day Cover', shortLabel: 'Pitchside' },
  { value: 'EVENT', label: 'Sporting Event Coverage', shortLabel: 'Event' },
];

const DURATIONS = [30, 45, 60, 90, 120];

type CategoryPricing = {
  [categoryId: string]: {
    [key in LocationType]?: number;
  };
};

interface PricingSetupPanelProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const PricingSetupPanel = ({ onComplete, onSkip }: PricingSetupPanelProps) => {
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { data: categories = [], isLoading: isLoadingCategories } = useServiceCategoriesByJobTitle(
    profile?.id ?? null,
  );
  const { data: pricing, isLoading: isLoadingPricing } = useFreelancerPricing();
  const { mutate: updateLocationPricing, isPending: isSavingLocation } = useUpdateLocationPricing();
  const { mutate: updateDurationPricing, isPending: isSavingDuration } = useUpdateDurationPricing();

  const [activeTab, setActiveTab] = useState<string>('duration');
  const [locationPrices, setLocationPrices] = useState<CategoryPricing>({});
  const [durationPrices, setDurationPrices] = useState<Record<number, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Check if user already has pricing configured
  const hasPricing = useMemo(() => {
    if (!pricing) return false;
    const hasServicePricing = pricing.servicePricing?.some(
      (sp) => sp.price > 0 || sp.locations?.some((l) => l.price > 0),
    );
    const hasDurationPricing = pricing.durationPricing?.some((dp) => dp.price > 0);
    return hasServicePricing || hasDurationPricing;
  }, [pricing]);

  // Initialize duration prices from API
  useEffect(() => {
    if (pricing?.durationPricing) {
      const prices: Record<number, string> = {};
      pricing.durationPricing.forEach((dp) => {
        if (DURATIONS.includes(dp.duration) && dp.price > 0) {
          prices[dp.duration] = dp.price.toString();
        }
      });
      setDurationPrices(prices);
    }
  }, [pricing]);

  // Initialize location prices from API
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

  // Auto-expand first category if no pricing exists
  useEffect(() => {
    if (categories.length > 0 && !hasPricing && expandedCategories.size === 0) {
      setExpandedCategories(new Set([categories[0]!.id]));
    }
  }, [categories, hasPricing, expandedCategories.size]);

  const handleDurationPriceChange = (duration: number, value: string) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    setDurationPrices((prev) => ({ ...prev, [duration]: value }));
  };

  const handleLocationPriceChange = (
    categoryId: string,
    locationType: LocationType,
    value: string,
  ) => {
    const price = value === '' ? 0 : parseFloat(value) || 0;
    setLocationPrices((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [locationType]: price > 0 ? price : undefined,
      },
    }));
  };

  const handleAddLocation = (categoryId: string, locationType: LocationType) => {
    setLocationPrices((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [locationType]: 0,
      },
    }));
    setExpandedCategories((prev) => new Set([...prev, categoryId]));
  };

  const handleRemoveLocation = (categoryId: string, locationType: LocationType) => {
    setLocationPrices((prev) => {
      const updated = { ...prev };
      if (updated[categoryId]) {
        const { [locationType]: _removed, ...rest } = updated[categoryId];
        updated[categoryId] = rest;
      }
      return updated;
    });
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

  const handleSaveDuration = () => {
    const pricingUpdates = Object.entries(durationPrices)
      .filter(([_, value]) => value !== '' && parseFloat(value) > 0)
      .map(([duration, price]) => ({
        duration: parseInt(duration),
        price: parseFloat(price),
      }));

    if (pricingUpdates.length === 0) {
      toast.error('Please set at least one price');
      return;
    }

    updateDurationPricing(pricingUpdates, {
      onSuccess: () => {
        toast.success('Duration pricing saved successfully!');
        onComplete();
      },
    });
  };

  const handleSaveLocation = () => {
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
      toast.error('Please set at least one price');
      return;
    }

    updateLocationPricing(pricingUpdates, {
      onSuccess: () => {
        toast.success('Service pricing saved successfully!');
        onComplete();
      },
    });
  };

  const hasAnyDurationPrice = useMemo(() => {
    return Object.values(durationPrices).some((p) => p !== '' && parseFloat(p) > 0);
  }, [durationPrices]);

  const hasAnyLocationPrice = useMemo(() => {
    return Object.values(locationPrices).some((locations) =>
      Object.values(locations).some((price) => price !== undefined && price > 0),
    );
  }, [locationPrices]);

  const getAvailableLocations = (categoryId: string) => {
    const usedLocations = new Set(Object.keys(locationPrices[categoryId] || {}));
    return LOCATION_TYPES.filter((lt) => !usedLocations.has(lt.value));
  };

  const getCategoryPricingSummary = (categoryId: string) => {
    const catPricing = locationPrices[categoryId] || {};
    const pricedLocations = Object.entries(catPricing)
      .filter(([_, price]) => price !== undefined && price > 0)
      .map(([loc]) => {
        const locationInfo = LOCATION_TYPES.find((lt) => lt.value === loc);
        return locationInfo?.shortLabel || loc;
      });
    return pricedLocations;
  };

  const isLoading = isLoadingProfile || isLoadingCategories || isLoadingPricing;
  const isSaving = isSavingLocation || isSavingDuration;

  if (isLoading) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="py-8 flex items-center justify-center">
          <LoadingSpinner size="medium" />
        </CardContent>
      </Card>
    );
  }

  // If user already has pricing, don't show the setup panel
  if (hasPricing) {
    return null;
  }

  // If user has no job title set
  if (!profile?.mainJobTitle) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg font-poppins text-amber-800">
              Complete Your Profile First
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-amber-700">
            Please set your job title in your profile settings to see the service categories
            available for you to price.
          </p>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={onSkip}>
              Skip for now
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-lg font-poppins text-amber-800">
            Set Your Pricing First
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-amber-700">
          Before creating slots, configure your pricing. Clients will see these prices when booking.
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="duration">Duration Pricing</TabsTrigger>
            <TabsTrigger value="service">Service Pricing</TabsTrigger>
          </TabsList>

          {/* Duration-based Pricing Tab */}
          <TabsContent value="duration" className="space-y-4 mt-4">
            <Alert className="bg-white border-amber-200">
              <AlertDescription className="text-sm text-muted-foreground">
                Set a flat rate per session duration. This is the quickest way to start accepting
                bookings.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {DURATIONS.map((duration) => (
                <div key={duration} className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">{duration} min</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      €
                    </span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={durationPrices[duration] || ''}
                      onChange={(e) => handleDurationPriceChange(duration, e.target.value)}
                      className="pl-7 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-amber-200">
              <Button variant="ghost" size="sm" onClick={onSkip} className="text-gray-500">
                Skip for now
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button
                onClick={handleSaveDuration}
                disabled={!hasAnyDurationPrice || isSaving}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save & Continue
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Service-based Pricing Tab */}
          <TabsContent value="service" className="space-y-4 mt-4">
            <Alert className="bg-white border-amber-200">
              <AlertDescription className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {profile.mainJobTitle.name}
                  </Badge>
                </div>
                Set prices for each service and location type you offer.
              </AlertDescription>
            </Alert>

            {categories.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">
                  No service categories available for {profile.mainJobTitle.name}.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {categories.map((category) => {
                  const categoryPricing = locationPrices[category.id] || {};
                  const configuredLocations = Object.entries(categoryPricing).filter(
                    ([_, price]) => price !== undefined,
                  );
                  const isExpanded = expandedCategories.has(category.id);
                  const availableLocations = getAvailableLocations(category.id);
                  const pricingSummary = getCategoryPricingSummary(category.id);

                  return (
                    <div key={category.id} className="border rounded-lg bg-white overflow-hidden">
                      <button
                        className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        onClick={() => toggleCategory(category.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium text-charcoal truncate">
                              {category.name}
                            </Label>
                            {pricingSummary.length > 0 && (
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                          {pricingSummary.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {pricingSummary.map((loc) => (
                                <Badge key={loc} variant="outline" className="text-xs py-0">
                                  {loc}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-2 pt-2 border-t border-gray-100">
                          {configuredLocations.map(([locationType, price]) => {
                            const locationInfo = LOCATION_TYPES.find(
                              (lt) => lt.value === locationType,
                            );
                            return (
                              <div key={locationType} className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground min-w-[140px] truncate">
                                  {locationInfo?.label || locationType}
                                </Label>
                                <div className="flex items-center gap-1 flex-1">
                                  <span className="text-xs text-muted-foreground">€</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={price || ''}
                                    onChange={(e) =>
                                      handleLocationPriceChange(
                                        category.id,
                                        locationType as LocationType,
                                        e.target.value,
                                      )
                                    }
                                    className="w-24 h-8 text-sm"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                                    onClick={() =>
                                      handleRemoveLocation(
                                        category.id,
                                        locationType as LocationType,
                                      )
                                    }
                                  >
                                    ×
                                  </Button>
                                </div>
                              </div>
                            );
                          })}

                          {availableLocations.length > 0 && (
                            <Select
                              onValueChange={(value) =>
                                handleAddLocation(category.id, value as LocationType)
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <div className="flex items-center gap-1">
                                  <Plus className="h-3 w-3" />
                                  <SelectValue placeholder="Add location type..." />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {availableLocations.map((lt) => (
                                  <SelectItem key={lt.value} value={lt.value} className="text-sm">
                                    {lt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-amber-200">
              <Button variant="ghost" size="sm" onClick={onSkip} className="text-gray-500">
                Skip for now
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button
                onClick={handleSaveLocation}
                disabled={!hasAnyLocationPrice || isSaving}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save & Continue
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
