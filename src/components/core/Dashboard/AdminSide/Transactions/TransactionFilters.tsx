'use client';

import { format } from 'date-fns';
import { CalendarIcon, Search, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { TransactionFilters as TransactionFiltersType } from '@/types/transaction';

interface TransactionFiltersProps {
  filters: TransactionFiltersType;
  onFiltersChange: (filters: TransactionFiltersType) => void;
}

export function TransactionFiltersComponent({ filters, onFiltersChange }: TransactionFiltersProps) {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
    to: filters.dateTo ? new Date(filters.dateTo) : undefined,
  });

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);
    onFiltersChange({
      ...filters,
      dateFrom: range.from ? range.from.toISOString().split('T')[0] : undefined,
      dateTo: range.to ? range.to.toISOString().split('T')[0] : undefined,
    });
  };

  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    onFiltersChange({
      dateFrom: undefined,
      dateTo: undefined,
      status: 'all',
      plan: 'all',
      paymentMethod: 'all',
      search: undefined,
      page: 1,
      limit: 20,
    });
  };

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    (filters.status && filters.status !== 'all') ||
    (filters.plan && filters.plan !== 'all') ||
    (filters.paymentMethod && filters.paymentMethod !== 'all') ||
    filters.search;

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-poppins font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from && dateRange.to
                  ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`
                  : dateRange.from
                    ? format(dateRange.from, 'MMM d, yyyy')
                    : 'Select dates'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range) {
                    handleDateRangeChange(range);
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, status: value as TransactionFiltersType['status'] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Plan Filter */}
        <div className="space-y-2">
          <Label>Plan</Label>
          <Select
            value={filters.plan || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, plan: value as TransactionFiltersType['plan'] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="BRONZE">Bronze</SelectItem>
              <SelectItem value="SILVER">Silver</SelectItem>
              <SelectItem value="GOLD">Gold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Method Filter */}
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select
            value={filters.paymentMethod || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                paymentMethod: value === 'all' ? 'all' : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Freelancer Search */}
        <div className="space-y-2">
          <Label>Search Freelancer</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Name or email..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
              className="pl-9"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
