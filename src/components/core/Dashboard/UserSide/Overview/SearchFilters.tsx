'use client';

import { ChevronDown, Filter } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { SearchFilters as SearchFiltersType } from '@/types/types';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  isOpen: boolean;
  onToggle: () => void;
  jobTitles: Array<{ id: string; name: string }>;
  serviceCategories: Array<{ id: string; name: string }>;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onToggle,
  jobTitles,
  serviceCategories,
}) => {
  const [specialtyOpen, setSpecialtyOpen] = useState(false);
  const [serviceCategoriesOpen, setServiceCategoriesOpen] = useState(false);
  const [verificationStatusOpen, setVerificationStatusOpen] = useState(false);

  const updateFilter = <K extends keyof SearchFiltersType>(key: K, value: SearchFiltersType[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleArrayFilter = (
    key: 'specialty' | 'serviceCategories' | 'sessionType' | 'verificationStatus',
    value: string,
  ) => {
    const currentArray = filters[key] as string[];
    if (currentArray.includes(value)) {
      updateFilter(key, currentArray.filter((item) => item !== value) as any);
    } else {
      updateFilter(key, [...currentArray, value] as any);
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      query: filters.query, // Keep query
      specialty: [],
      serviceCategories: [],
      location: '',
      priceMin: undefined,
      priceMax: undefined,
      sessionType: [],
      availableThisWeek: false,
      verificationStatus: [],
      minRating: undefined,
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.specialty.length > 0) count++;
    if (filters.serviceCategories.length > 0) count++;
    if (filters.location) count++;
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) count++;
    if (filters.sessionType.length > 0) count++;
    if (filters.availableThisWeek) count++;
    if (filters.verificationStatus.length > 0) count++;
    if (filters.minRating !== undefined) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <Button type="button" variant="outline" onClick={onToggle} className="w-full justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 Results</h3>
            {activeFilterCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-primary hover:text-primary/80"
              >
                Clear All
              </Button>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Specialty/Job Title Multi-Select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Specialty</Label>
              <Popover open={specialtyOpen} onOpenChange={setSpecialtyOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {filters.specialty.length === 0
                      ? 'Select specialties...'
                      : filters.specialty.length === 1
                        ? jobTitles.find((jt) => jt.id === filters.specialty[0])?.name ||
                          '1 selected'
                        : `${filters.specialty.length} selected`}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search specialties..." />
                    <CommandList>
                      <CommandEmpty>No specialties found.</CommandEmpty>
                      <CommandGroup>
                        {jobTitles.map((jobTitle) => (
                          <CommandItem
                            key={jobTitle.id}
                            value={jobTitle.id}
                            onSelect={() => toggleArrayFilter('specialty', jobTitle.id)}
                          >
                            <Checkbox
                              checked={filters.specialty.includes(jobTitle.id)}
                              className="mr-2"
                            />
                            {jobTitle.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Service Categories Multi-Select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Service Categories</Label>
              <Popover open={serviceCategoriesOpen} onOpenChange={setServiceCategoriesOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {filters.serviceCategories.length === 0
                      ? 'Select categories...'
                      : filters.serviceCategories.length === 1
                        ? serviceCategories.find((sc) => sc.id === filters.serviceCategories[0])
                            ?.name || '1 selected'
                        : `${filters.serviceCategories.length} selected`}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandList>
                      <CommandEmpty>No categories found.</CommandEmpty>
                      <CommandGroup>
                        {serviceCategories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={category.id}
                            onSelect={() => toggleArrayFilter('serviceCategories', category.id)}
                          >
                            <Checkbox
                              checked={filters.serviceCategories.includes(category.id)}
                              className="mr-2"
                            />
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Location</Label>
              <Input
                placeholder="Enter city..."
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
              />
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Price Range (EUR)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin || ''}
                  onChange={(e) =>
                    updateFilter('priceMin', e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full"
                />
                <span className="text-gray-500">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax || ''}
                  onChange={(e) =>
                    updateFilter('priceMax', e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* Session Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Session Type</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="session-home"
                    checked={filters.sessionType.includes('HOME')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        toggleArrayFilter('sessionType', 'HOME');
                      } else {
                        updateFilter(
                          'sessionType',
                          filters.sessionType.filter((t) => t !== 'HOME'),
                        );
                      }
                    }}
                  />
                  <Label htmlFor="session-home" className="font-normal cursor-pointer">
                    Home Visit
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="session-clinic"
                    checked={filters.sessionType.includes('CLINIC')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        toggleArrayFilter('sessionType', 'CLINIC');
                      } else {
                        updateFilter(
                          'sessionType',
                          filters.sessionType.filter((t) => t !== 'CLINIC'),
                        );
                      }
                    }}
                  />
                  <Label htmlFor="session-clinic" className="font-normal cursor-pointer">
                    Clinic
                  </Label>
                </div>
              </div>
            </div>

            {/* Available This Week */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Available This Week</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={filters.availableThisWeek}
                  onCheckedChange={(checked) => updateFilter('availableThisWeek', checked)}
                />
                <Label className="font-normal">Show only available this week</Label>
              </div>
            </div>

            {/* Verification Status Multi-Select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Verification Status</Label>
              <Popover open={verificationStatusOpen} onOpenChange={setVerificationStatusOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {filters.verificationStatus.length === 0
                      ? 'Select status...'
                      : filters.verificationStatus.length === 1
                        ? filters.verificationStatus[0]
                        : `${filters.verificationStatus.length} selected`}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                          <CommandItem
                            key={status}
                            value={status}
                            onSelect={() => toggleArrayFilter('verificationStatus', status)}
                          >
                            <Checkbox
                              checked={filters.verificationStatus.includes(status as any)}
                              className="mr-2"
                            />
                            {status}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Minimum Rating</Label>
              <Select
                value={filters.minRating?.toString() || 'any'}
                onValueChange={(value) =>
                  updateFilter('minRating', value === 'any' ? undefined : Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any rating</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                  <SelectItem value="5">5 stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
