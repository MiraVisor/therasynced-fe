'use client';

import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/ui/tier-badge';
import { SearchFilters as SearchFiltersType } from '@/types/types';

interface FilterChipsProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  jobTitles: Array<{ id: string; name: string }>;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onFiltersChange,
  jobTitles,
}) => {
  const updateFilter = <K extends keyof SearchFiltersType>(key: K, value: SearchFiltersType[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleArrayFilter = (
    key: 'specialty' | 'serviceCategories' | 'sessionType' | 'verificationStatus' | 'tier',
    value: string,
  ) => {
    const currentArray = filters[key] as string[];
    if (currentArray.includes(value)) {
      updateFilter(
        key,
        currentArray.filter((item) => item !== value) as SearchFiltersType[typeof key],
      );
    } else {
      updateFilter(key, [...currentArray, value] as SearchFiltersType[typeof key]);
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      query: '',
      specialty: [],
      serviceCategories: [],
      location: '',
      priceMin: undefined,
      priceMax: undefined,
      sessionType: [],
      availableThisWeek: false,
      verificationStatus: [],
      minRating: undefined,
      tier: [],
    });
  };

  const hasActiveFilters =
    filters.specialty.length > 0 ||
    filters.serviceCategories.length > 0 ||
    filters.location ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.sessionType.length > 0 ||
    filters.availableThisWeek ||
    filters.verificationStatus.length > 0 ||
    filters.minRating !== undefined ||
    (filters.tier && filters.tier.length > 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Quick Toggle Filters */}
      <Button
        variant={filters.availableThisWeek ? 'default' : 'outline'}
        size="sm"
        className="h-8"
        onClick={() => updateFilter('availableThisWeek', !filters.availableThisWeek)}
      >
        Available This Week
      </Button>

      <Button
        variant={filters.verificationStatus.includes('APPROVED') ? 'default' : 'outline'}
        size="sm"
        className="h-8"
        onClick={() => {
          if (filters.verificationStatus.includes('APPROVED')) {
            updateFilter(
              'verificationStatus',
              filters.verificationStatus.filter((s) => s !== 'APPROVED'),
            );
          } else {
            updateFilter('verificationStatus', [...filters.verificationStatus, 'APPROVED']);
          }
        }}
      >
        Verified Only
      </Button>

      {/* Tier Quick Toggle Buttons */}
      <button
        type="button"
        onClick={() => toggleArrayFilter('tier', 'GOLD')}
        className={`h-8 px-2 transition-opacity ${
          filters.tier?.includes('GOLD') ? 'opacity-100' : 'opacity-60 hover:opacity-80'
        }`}
      >
        <TierBadge tier="GOLD" size="sm" showIcon={true} />
      </button>
      <button
        type="button"
        onClick={() => toggleArrayFilter('tier', 'SILVER')}
        className={`h-8 px-2 transition-opacity ${
          filters.tier?.includes('SILVER') ? 'opacity-100' : 'opacity-60 hover:opacity-80'
        }`}
      >
        <TierBadge tier="SILVER" size="sm" showIcon={true} />
      </button>
      <button
        type="button"
        onClick={() => toggleArrayFilter('tier', 'BRONZE')}
        className={`h-8 px-2 transition-opacity ${
          filters.tier?.includes('BRONZE') ? 'opacity-100' : 'opacity-60 hover:opacity-80'
        }`}
      >
        <TierBadge tier="BRONZE" size="sm" showIcon={true} />
      </button>

      {/* Specialty Quick Toggle Buttons */}
      {jobTitles.map((jobTitle) => (
        <Button
          key={jobTitle.id}
          variant={filters.specialty.includes(jobTitle.id) ? 'default' : 'outline'}
          size="sm"
          className="h-8"
          onClick={() => toggleArrayFilter('specialty', jobTitle.id)}
        >
          {jobTitle.name}
        </Button>
      ))}

      {filters.location && (
        <Badge variant="secondary" className="h-8 px-3">
          Location: {filters.location}
          <button
            type="button"
            onClick={() => updateFilter('location', '')}
            className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {(filters.priceMin !== undefined || filters.priceMax !== undefined) && (
        <Badge variant="secondary" className="h-8 px-3">
          Price: {filters.priceMin || 0}€ - {filters.priceMax || '∞'}€
          <button
            type="button"
            onClick={() => {
              updateFilter('priceMin', undefined);
              updateFilter('priceMax', undefined);
            }}
            className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Active Tier Chips */}
      {filters.tier &&
        filters.tier.length > 0 &&
        filters.tier.map((tier) => (
          <Badge key={`tier-${tier}`} variant="secondary" className="h-8 px-3">
            {tier}
            <button
              type="button"
              onClick={() => toggleArrayFilter('tier', tier)}
              className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

      {/* Clear All Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-primary hover:text-primary/80"
          onClick={clearAllFilters}
        >
          Clear All
        </Button>
      )}
    </div>
  );
};
