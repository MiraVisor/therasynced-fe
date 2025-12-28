'use client';

import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useFreelancerPricing, useUpdateServicePricing } from '@/hooks/queries/usePricing';
import { useMyServices } from '@/hooks/queries/useServices';
import type { ServicePricing, UpdateServicePricingDto } from '@/types/pricing';

export const ServicePricingSection = () => {
  const { data: services = [], isLoading: isLoadingServices } = useMyServices();
  const { data: pricing, isLoading: isLoadingPricing } = useFreelancerPricing();
  const { mutate: updatePricing, isPending: isSaving } = useUpdateServicePricing();

  // Local state for prices
  const [servicePrices, setServicePrices] = useState<Record<string, number>>({});

  // Initialize prices from API or set to empty
  useEffect(() => {
    if (pricing?.servicePricing) {
      const prices: Record<string, number> = {};
      pricing.servicePricing.forEach((sp) => {
        prices[sp.serviceId] = sp.price;
      });
      setServicePrices(prices);
    }
  }, [pricing]);

  // Create a map of service pricing for quick lookup
  const pricingMap = useMemo(() => {
    const map = new Map<string, ServicePricing>();
    pricing?.servicePricing.forEach((sp) => {
      map.set(sp.serviceId, sp);
    });
    return map;
  }, [pricing]);

  const handlePriceChange = (serviceId: string, value: string) => {
    const price = value === '' ? 0 : parseFloat(value) || 0;
    setServicePrices((prev) => ({
      ...prev,
      [serviceId]: price,
    }));
  };

  const handleSave = () => {
    const pricingUpdates: UpdateServicePricingDto[] = Object.entries(servicePrices)
      .filter(([_, price]) => price > 0)
      .map(([serviceId, price]) => ({
        serviceCategoryId: serviceId, // API expects serviceCategoryId
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

    // Check for new services with prices
    for (const [serviceId, price] of Object.entries(servicePrices)) {
      if (price > 0 && !pricing.servicePricing.find((sp) => sp.serviceId === serviceId)) {
        return true;
      }
    }

    return false;
  }, [servicePrices, pricing]);

  if (isLoadingServices || isLoadingPricing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing</CardTitle>
          <CardDescription>Set prices for each service you offer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="medium" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing</CardTitle>
          <CardDescription>Set prices for each service you offer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">You don't have any services yet.</p>
            <p className="text-xs mt-2">Create services to set their pricing.</p>
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
            <CardDescription>Set prices for each service you offer</CardDescription>
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
          {services.map((service) => {
            const currentPrice = servicePrices[service.id] || 0;
            const existingPricing = pricingMap.get(service.id);

            return (
              <div
                key={service.id}
                className="flex items-center gap-4 p-4 border rounded-lg bg-white"
              >
                <div className="flex-1">
                  <Label className="text-sm font-semibold text-charcoal">{service.name}</Label>
                  {service.description && (
                    <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
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
                    onChange={(e) => handlePriceChange(service.id, e.target.value)}
                    className="w-32"
                  />
                  {existingPricing && currentPrice === existingPricing.price && (
                    <span className="text-xs text-muted-foreground">(saved)</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {services.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Set a price for each service. Prices are in EUR. Leave empty or set to 0 if you don't
              want to charge for a specific service.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
