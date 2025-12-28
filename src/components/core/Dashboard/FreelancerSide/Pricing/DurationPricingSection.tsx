'use client';

import { Plus, Save, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useFreelancerPricing, useUpdateDurationPricing } from '@/hooks/queries/usePricing';
import type { DurationPricing, UpdateDurationPricingDto } from '@/types/pricing';

const DEFAULT_DURATIONS = [30, 45, 60, 90, 120];

export const DurationPricingSection = () => {
  const { data: pricing, isLoading: isLoadingPricing } = useFreelancerPricing();
  const { mutate: updatePricing, isPending: isSaving } = useUpdateDurationPricing();

  // Local state for prices
  const [durationPrices, setDurationPrices] = useState<Record<number, number>>({});
  const [customDurations, setCustomDurations] = useState<number[]>([]);

  // Initialize prices from API
  useEffect(() => {
    if (pricing?.durationPricing) {
      const prices: Record<number, number> = {};
      const custom: number[] = [];

      pricing.durationPricing.forEach((dp) => {
        prices[dp.duration] = dp.price;
        if (!DEFAULT_DURATIONS.includes(dp.duration)) {
          custom.push(dp.duration);
        }
      });

      setDurationPrices(prices);
      setCustomDurations(custom);
    }
  }, [pricing]);

  // Create a map of duration pricing for quick lookup
  const pricingMap = useMemo(() => {
    const map = new Map<number, DurationPricing>();
    pricing?.durationPricing.forEach((dp) => {
      map.set(dp.duration, dp);
    });
    return map;
  }, [pricing]);

  const handlePriceChange = (duration: number, value: string) => {
    const price = value === '' ? 0 : parseFloat(value) || 0;
    setDurationPrices((prev) => ({
      ...prev,
      [duration]: price,
    }));
  };

  const handleAddCustomDuration = () => {
    const newDuration = 15; // Default to 15 minutes, user can change
    setCustomDurations((prev) => [...prev, newDuration]);
    setDurationPrices((prev) => ({
      ...prev,
      [newDuration]: 0,
    }));
  };

  const handleRemoveCustomDuration = (duration: number) => {
    setCustomDurations((prev) => prev.filter((d) => d !== duration));
    setDurationPrices((prev) => {
      const newPrices = { ...prev };
      delete newPrices[duration];
      return newPrices;
    });
  };

  const handleCustomDurationChange = (oldDuration: number, newDuration: number) => {
    if (newDuration <= 0 || newDuration % 15 !== 0) {
      return; // Only allow multiples of 15 minutes
    }

    setCustomDurations((prev) => prev.map((d) => (d === oldDuration ? newDuration : d)));
    setDurationPrices((prev) => {
      const newPrices = { ...prev };
      if (prev[oldDuration] !== undefined) {
        newPrices[newDuration] = prev[oldDuration];
        delete newPrices[oldDuration];
      }
      return newPrices;
    });
  };

  const handleSave = () => {
    const pricingUpdates: UpdateDurationPricingDto[] = Object.entries(durationPrices)
      .filter(([_, price]) => price > 0)
      .map(([duration, price]) => ({
        duration: parseInt(duration.toString()),
        price,
      }));

    if (pricingUpdates.length === 0) {
      return;
    }

    updatePricing(pricingUpdates);
  };

  const hasChanges = useMemo(() => {
    if (!pricing?.durationPricing) {
      return Object.keys(durationPrices).some((d) => durationPrices[parseInt(d)] > 0);
    }

    // Check for changes in existing durations
    for (const dp of pricing.durationPricing) {
      if (durationPrices[dp.duration] !== undefined && durationPrices[dp.duration] !== dp.price) {
        return true;
      }
    }

    // Check for new durations with prices
    for (const [duration, price] of Object.entries(durationPrices)) {
      const dur = parseInt(duration);
      if (price > 0 && !pricing.durationPricing.find((dp) => dp.duration === dur)) {
        return true;
      }
    }

    // Check for removed durations
    const currentDurations = new Set(
      Object.keys(durationPrices)
        .map((d) => parseInt(d))
        .filter((d) => durationPrices[d] > 0),
    );
    const savedDurations = new Set(pricing.durationPricing.map((dp) => dp.duration));
    if (currentDurations.size !== savedDurations.size) {
      return true;
    }

    return false;
  }, [durationPrices, pricing]);

  const allDurations = [...DEFAULT_DURATIONS, ...customDurations].sort((a, b) => a - b);

  if (isLoadingPricing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Duration Pricing</CardTitle>
          <CardDescription>Set prices for different slot durations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="medium" />
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
            <CardTitle>Duration Pricing</CardTitle>
            <CardDescription>Set prices for different slot durations</CardDescription>
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
          {allDurations.map((duration) => {
            const currentPrice = durationPrices[duration] || 0;
            const existingPricing = pricingMap.get(duration);
            const isCustom = !DEFAULT_DURATIONS.includes(duration);

            return (
              <div
                key={duration}
                className="flex items-center gap-4 p-4 border rounded-lg bg-white"
              >
                <div className="flex-1">
                  {isCustom ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="15"
                        step="15"
                        value={duration}
                        onChange={(e) =>
                          handleCustomDurationChange(duration, parseInt(e.target.value) || 15)
                        }
                        className="w-24"
                      />
                      <Label className="text-sm font-semibold text-charcoal">minutes</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCustomDuration(duration)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Label className="text-sm font-semibold text-charcoal">
                      {duration} minutes
                    </Label>
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
                    onChange={(e) => handlePriceChange(duration, e.target.value)}
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

        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleAddCustomDuration} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Duration
          </Button>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Set prices for different slot durations. Prices are in EUR. Common durations are
            pre-filled, but you can add custom durations (must be multiples of 15 minutes).
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
