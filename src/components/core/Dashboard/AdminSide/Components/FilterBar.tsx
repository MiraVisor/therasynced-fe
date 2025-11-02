import { Search, X } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    value?: string;
    options: FilterOption[];
    onValueChange?: (value: string) => void;
  }>;
  onReset?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  onReset,
  className,
}) => {
  const hasActiveFilters =
    filters.some((f) => f.value) || searchValue || (searchValue && searchValue.trim() !== '');

  return (
    <EnhancedCard variant="default" className={`p-4 ${className || ''}`}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10 font-open-sans"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 flex-1">
          {filters.map((filter) => (
            <Select key={filter.key} value={filter.value} onValueChange={filter.onValueChange}>
              <SelectTrigger className="w-full md:w-[180px] font-inter">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        {/* Reset Button */}
        {hasActiveFilters && onReset && (
          <Button variant="outline" size="sm" onClick={onReset} className="font-inter">
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>
    </EnhancedCard>
  );
};
