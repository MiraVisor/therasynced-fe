'use client';

import { ChevronDown, ChevronUp, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useFreelancerPricing, useUpdateServicePricing } from '@/hooks/queries/usePricing';
import { useServiceCategories } from '@/hooks/queries/useServiceCategories';
import { UpdateServicePricingDto } from '@/types';

export const ServicePricingSection = () => {
  const { data: categories = [], isLoading: isLoadingCategories } = useServiceCategories();
  const { data: pricing, isLoading: isLoadingPricing } = useFreelancerPricing();
  const { mutate: updatePricing, isPending: isSaving } = useUpdateServicePricing();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group categories by job title - show all categories as returned by backend
  const groupedCategories = useMemo(() => {
    const groups = new Map<string, typeof categories>();
    categories.forEach((category) => {
      const jobTitleKey = category.jobTitle?.id || 'other';
      if (!groups.has(jobTitleKey)) {
        groups.set(jobTitleKey, []);
      }
      groups.get(jobTitleKey)!.push(category);
    });
    return groups;
  }, [categories]);

  const toggleGroup = (jobTitleId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobTitleId)) {
        newSet.delete(jobTitleId);
      } else {
        newSet.add(jobTitleId);
      }
      return newSet;
    });
  };

  // Local state for prices
  const [servicePrices, setServicePrices] = useState<Record<string, number>>({});

  // Initialize prices from API - serviceId in response is actually categoryId
  useEffect(() => {
    if (pricing?.servicePricing) {
      const prices: Record<string, number> = {};
      pricing.servicePricing.forEach((sp) => {
        // serviceId in response is actually the categoryId
        prices[sp.serviceId] = sp.price;
      });
      setServicePrices(prices);
    }
  }, [pricing]);

  const handlePriceChange = (categoryId: string, value: string) => {
    const price = value === '' ? 0 : parseFloat(value) || 0;
    setServicePrices((prev) => ({
      ...prev,
      [categoryId]: price,
    }));
  };

  const handleSave = () => {
    const pricingUpdates: UpdateServicePricingDto[] = Object.entries(servicePrices)
      .filter(([_, price]) => price > 0)
      .map(([categoryId, price]) => ({
        serviceCategoryId: categoryId,
        price,
      }));

    if (pricingUpdates.length === 0) {
      return;
    }

    updatePricing(pricingUpdates);
  };

  const hasChanges = useMemo(() => {
    if (!pricing?.servicePricing) return Object.keys(servicePrices).length > 0;

    for (const sp of pricing.servicePricing) {
      if (servicePrices[sp.serviceId] !== undefined && servicePrices[sp.serviceId] !== sp.price) {
        return true;
      }
    }

    // Check for new categories with prices
    for (const [categoryId, price] of Object.entries(servicePrices)) {
      if (price > 0 && !pricing.servicePricing.find((sp) => sp.serviceId === categoryId)) {
        return true;
      }
    }

    return false;
  }, [servicePrices, pricing]);

  if (isLoadingCategories || isLoadingPricing) {
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

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing</CardTitle>
          <CardDescription>Set prices for each service category you offer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No service categories available.</p>
            <p className="text-xs mt-2">Please contact support if you believe this is an error.</p>
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
            <CardDescription>Set prices for each service category you offer</CardDescription>
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
        <div className="space-y-4">
          {Array.from(groupedCategories.entries()).map(([jobTitleId, categoryList]) => {
            const jobTitle = categoryList[0]?.jobTitle;
            const isExpanded = expandedGroups.has(jobTitleId);

            return (
              <div key={jobTitleId} className="border rounded-lg bg-white">
                <button
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg"
                  onClick={() => toggleGroup(jobTitleId)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-charcoal">
                      {jobTitle?.name || 'Other Categories'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({categoryList.length} {categoryList.length === 1 ? 'category' : 'categories'}
                      )
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 pt-2">
                    {categoryList.map((category) => {
                      const currentPrice = servicePrices[category.id] || 0;

                      return (
                        <div
                          key={category.id}
                          className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50"
                        >
                          <div className="flex-1">
                            <Label className="text-sm font-semibold text-charcoal">
                              {category.name}
                            </Label>
                            {category.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {category.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">EUR</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={currentPrice > 0 ? currentPrice : ''}
                              onChange={(e) => handlePriceChange(category.id, e.target.value)}
                              className="w-32"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {categories.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Set a price for each service category. Prices are in EUR. Leave empty or set to 0 if
              you don't want to charge for a specific category.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
