'use client';

import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchFilters } from '@/types/types';

interface ActiveFiltersChipsProps {
  filters: SearchFilters;
  onRemoveFilter: (filterKey: keyof SearchFilters, value?: string) => void;
  onClearAll: () => void;
  jobTitles: Array<{ id: string; name: string }>;
  serviceCategories: Array<{ id: string; name: string }>;
}

export const ActiveFiltersChips: React.FC<ActiveFiltersChipsProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
  jobTitles,
  serviceCategories,
}) => {
  const getFilterChips = () => {
    const chips: Array<{ key: keyof SearchFilters; label: string; value?: string }> = [];

    // Specialty chips
    filters.specialty.forEach((id) => {
      const jobTitle = jobTitles.find((jt) => jt.id === id);
      if (jobTitle) {
        chips.push({
          key: 'specialty',
          label: `Specialty: ${jobTitle.name}`,
          value: id,
        });
      }
    });

    // Service Categories chips
    filters.serviceCategories.forEach((id) => {
      const category = serviceCategories.find((sc) => sc.id === id);
      if (category) {
        chips.push({
          key: 'serviceCategories',
          label: `Category: ${category.name}`,
          value: id,
        });
      }
    });

    // Location chip
    if (filters.location) {
      chips.push({
        key: 'location',
        label: `Location: ${filters.location}`,
      });
    }

    // Price range chip
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const min = filters.priceMin !== undefined ? `€${filters.priceMin}` : '';
      const max = filters.priceMax !== undefined ? `€${filters.priceMax}` : '';
      const range = [min, max].filter(Boolean).join(' - ');
      chips.push({
        key: 'priceMin',
        label: `Price: ${range}`,
      });
    }

    // Session type chips
    filters.sessionType.forEach((type) => {
      chips.push({
        key: 'sessionType',
        label: `Session: ${type === 'HOME' ? 'Home Visit' : 'Clinic'}`,
        value: type,
      });
    });

    // Available this week chip
    if (filters.availableThisWeek) {
      chips.push({
        key: 'availableThisWeek',
        label: 'Available This Week',
      });
    }

    // Verification status chips
    filters.verificationStatus.forEach((status) => {
      chips.push({
        key: 'verificationStatus',
        label: `Verification: ${status}`,
        value: status,
      });
    });

    // Minimum rating chip
    if (filters.minRating !== undefined) {
      chips.push({
        key: 'minRating',
        label: `Rating: ${filters.minRating}+ stars`,
      });
    }

    return chips;
  };

  const chips = getFilterChips();

  if (chips.length === 0) {
    return null;
  }

  const handleRemove = (chip: { key: keyof SearchFilters; value?: string }) => {
    if (chip.value !== undefined) {
      // For array filters, remove the specific value
      const currentArray = filters[chip.key] as string[];
      if (Array.isArray(currentArray)) {
        onRemoveFilter(chip.key, chip.value);
      }
    } else {
      // For non-array filters, clear the entire filter
      onRemoveFilter(chip.key);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Active filters:</span>
      {chips.map((chip, index) => (
        <Badge
          key={`${chip.key}-${chip.value || index}`}
          variant="secondary"
          className="flex items-center gap-1 px-3 py-1"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => handleRemove(chip)}
            className="ml-1 rounded-full hover:bg-gray-300 p-0.5"
            aria-label={`Remove ${chip.label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {chips.length > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 text-xs text-primary hover:text-primary/80"
        >
          Clear All
        </Button>
      )}
    </div>
  );
};
