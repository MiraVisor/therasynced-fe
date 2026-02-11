'use client';

import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

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
  useDeletePitchsidePricing,
  useFreelancerPricing,
  useUpdatePitchsidePricing,
} from '@/hooks/queries/usePricing';
import type { PitchsideSport } from '@/types/pricing';

const SPORTS: { value: PitchsideSport; label: string }[] = [
  { value: 'GAA', label: 'GAA (Gaelic Athletic Association)' },
  { value: 'Soccer', label: 'Soccer / Football' },
  { value: 'Rugby', label: 'Rugby' },
  { value: 'Other', label: 'Other Sport' },
];

interface PricingRow {
  id: string;
  sport: PitchsideSport;
  sportOther: string;
  price: string;
}

export const PitchsidePricingSection = () => {
  const { data: pricing, isLoading: isLoadingPricing } = useFreelancerPricing();
  const { mutate: updatePricing, isPending: isSaving } = useUpdatePitchsidePricing();
  const { mutate: deletePricing, isPending: isDeleting } = useDeletePitchsidePricing();

  const [pricingRows, setPricingRows] = useState<PricingRow[]>([]);

  // Initialize from API data
  useEffect(() => {
    if (pricing?.pitchsidePricing) {
      const rows: PricingRow[] = pricing.pitchsidePricing.map((p, index) => ({
        id: p.id || `existing-${index}`,
        sport: p.sport,
        sportOther: p.sportOther || '',
        price: p.price > 0 ? p.price.toString() : '',
      }));
      setPricingRows(rows);
    }
  }, [pricing]);

  const handleAddRow = () => {
    // Find the first sport that's not already used
    const usedSports = new Set(pricingRows.map((r) => r.sport));
    const availableSport = SPORTS.find((s) => !usedSports.has(s.value));

    if (!availableSport) {
      toast.info('All sports have been added. Use "Other" for additional sports.');
      return;
    }

    setPricingRows((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        sport: availableSport.value,
        sportOther: '',
        price: '',
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    const row = pricingRows.find((r) => r.id === id);
    if (row && !row.id.startsWith('new-')) {
      // Delete from backend
      deletePricing(row.sport, {
        onSuccess: () => {
          setPricingRows((prev) => prev.filter((r) => r.id !== id));
        },
      });
    } else {
      // Just remove from local state
      setPricingRows((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleUpdateRow = (id: string, field: keyof PricingRow, value: string) => {
    setPricingRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        return { ...row, [field]: value };
      }),
    );
  };

  const handleSave = () => {
    // Validate
    const validRows = pricingRows.filter((row) => {
      const price = parseFloat(row.price);
      if (isNaN(price) || price <= 0) return false;
      if (row.sport === 'Other' && !row.sportOther.trim()) {
        toast.error('Please specify the sport name for "Other" category');
        return false;
      }
      return true;
    });

    if (validRows.length === 0) {
      toast.error('Please add at least one valid sport pricing');
      return;
    }

    const pricingData = validRows.map((row) => ({
      sport: row.sport,
      sportOther: row.sport === 'Other' ? row.sportOther.trim() : undefined,
      price: parseFloat(row.price),
    }));

    updatePricing(pricingData, {
      onSuccess: () => {
        toast.success('Pitchside pricing saved successfully');
      },
    });
  };

  const hasChanges = useMemo(() => {
    if (!pricing?.pitchsidePricing) {
      return pricingRows.some((r) => parseFloat(r.price) > 0);
    }

    // Compare current rows with API data
    const apiPricing = pricing.pitchsidePricing;
    if (pricingRows.length !== apiPricing.length) return true;

    for (const row of pricingRows) {
      const apiRow = apiPricing.find((p) => p.sport === row.sport);
      if (!apiRow) return true;
      if (parseFloat(row.price) !== apiRow.price) return true;
      if (row.sport === 'Other' && row.sportOther !== (apiRow.sportOther || '')) return true;
    }

    return false;
  }, [pricingRows, pricing]);

  const getAvailableSports = (currentSport: PitchsideSport) => {
    const usedSports = new Set(pricingRows.map((r) => r.sport).filter((s) => s !== currentSport));
    return SPORTS.filter((s) => !usedSports.has(s.value) || s.value === 'Other');
  };

  if (isLoadingPricing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pitch-Side / Game-Day Pricing</CardTitle>
          <CardDescription>Set sport-specific prices for game-day coverage</CardDescription>
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
            <CardTitle>Pitch-Side / Game-Day Pricing</CardTitle>
            <CardDescription>
              Set different prices for each sport you cover at games and events
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
      <CardContent className="space-y-4">
        {pricingRows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <p className="text-sm">No sport pricing configured yet.</p>
            <p className="text-xs mt-1">
              Add pricing for sports you provide pitch-side coverage for.
            </p>
            <Button variant="outline" size="sm" onClick={handleAddRow} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Sport Pricing
            </Button>
          </div>
        ) : (
          <>
            {pricingRows.map((row) => (
              <div key={row.id} className="flex items-start gap-3 p-4 border rounded-lg bg-white">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground mb-1 block">Sport</Label>
                      <Select
                        value={row.sport}
                        onValueChange={(value) =>
                          handleUpdateRow(row.id, 'sport', value as PitchsideSport)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSports(row.sport).map((sport) => (
                            <SelectItem key={sport.value} value={sport.value}>
                              {sport.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Price (EUR)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          €
                        </span>
                        <Input
                          type="text"
                          inputMode="decimal"
                          placeholder="0.00"
                          value={row.price}
                          onChange={(e) => {
                            const { value } = e.target;
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              handleUpdateRow(row.id, 'price', value);
                            }
                          }}
                          className="pl-7"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-5"
                      onClick={() => handleRemoveRow(row.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  {row.sport === 'Other' && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Sport Name (required)
                      </Label>
                      <Input
                        placeholder="Enter sport name..."
                        value={row.sportOther}
                        onChange={(e) => handleUpdateRow(row.id, 'sportOther', e.target.value)}
                        className="max-w-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={handleAddRow}>
              <Plus className="h-4 w-4 mr-2" />
              Add Another Sport
            </Button>
          </>
        )}

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Set prices for pitch-side and game-day coverage by sport. Common sports include GAA,
            Soccer, and Rugby. Use &quot;Other&quot; to add custom sports like Hockey, Basketball,
            etc.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
