'use client';

import { Download, FileText, Filter, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TransactionTable } from '@/components/core/Dashboard/AdminSide/Transactions/TransactionTable';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/button';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAdminTransactions,
  useExportTransactions,
  useTransactionStats,
} from '@/hooks/queries/useAdminTransactions';
import { TransactionFilters } from '@/types/transaction';

export default function AdminTransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  const getFiltersFromUrl = (): TransactionFilters => {
    return {
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      status: (searchParams.get('status') as TransactionFilters['status']) || 'all',
      plan: (searchParams.get('plan') as TransactionFilters['plan']) || 'all',
      paymentMethod: searchParams.get('paymentMethod') || 'all',
      search: searchParams.get('search') || undefined,
      freelancerId: searchParams.get('freelancerId') || undefined,
    };
  };

  // Applied filters - used for API calls
  const [filters, setFilters] = useState<TransactionFilters>(getFiltersFromUrl());
  // Pending filters - what user is selecting (not yet applied)
  const [pendingFilters, setPendingFilters] = useState<TransactionFilters>(getFiltersFromUrl());
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('pageSize') || '20', 10));
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search || '');

  // Update URL when filters change
  const updateUrlParams = (
    newFilters: TransactionFilters,
    newPage: number,
    newPageSize: number,
  ) => {
    const params = new URLSearchParams();

    if (newFilters.dateFrom) params.set('dateFrom', newFilters.dateFrom);
    if (newFilters.dateTo) params.set('dateTo', newFilters.dateTo);
    if (newFilters.status && newFilters.status !== 'all') params.set('status', newFilters.status);
    if (newFilters.plan && newFilters.plan !== 'all') params.set('plan', newFilters.plan);
    if (newFilters.paymentMethod && newFilters.paymentMethod !== 'all')
      params.set('paymentMethod', newFilters.paymentMethod);
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.freelancerId) params.set('freelancerId', newFilters.freelancerId);
    if (newPage > 1) params.set('page', newPage.toString());
    if (newPageSize !== 20) params.set('pageSize', newPageSize.toString());

    const queryString = params.toString();
    const newUrl = queryString
      ? `/dashboard/admin/transactions?${queryString}`
      : '/dashboard/admin/transactions';
    router.push(newUrl, { scroll: false });
  };

  // Update debounced search when filters are applied (not on every keystroke)
  // This ensures search only triggers API calls when Apply Filters is clicked
  useEffect(() => {
    setDebouncedSearch(filters.search || '');
  }, [filters.search]);

  // Sync filters from URL on mount and when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlFilters = getFiltersFromUrl();
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlPageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    // Only update if values actually changed to avoid unnecessary re-renders
    setFilters((prev) => {
      const hasChanged =
        prev.dateFrom !== urlFilters.dateFrom ||
        prev.dateTo !== urlFilters.dateTo ||
        prev.status !== urlFilters.status ||
        prev.plan !== urlFilters.plan ||
        prev.paymentMethod !== urlFilters.paymentMethod ||
        prev.search !== urlFilters.search ||
        prev.freelancerId !== urlFilters.freelancerId;

      return hasChanged ? urlFilters : prev;
    });

    // Also sync pending filters from URL
    setPendingFilters((prev) => {
      const hasChanged =
        prev.dateFrom !== urlFilters.dateFrom ||
        prev.dateTo !== urlFilters.dateTo ||
        prev.status !== urlFilters.status ||
        prev.plan !== urlFilters.plan ||
        prev.paymentMethod !== urlFilters.paymentMethod ||
        prev.search !== urlFilters.search ||
        prev.freelancerId !== urlFilters.freelancerId;

      return hasChanged ? urlFilters : prev;
    });

    setSearchQuery(urlFilters.search || '');
    setPage((prev) => (prev !== urlPage ? urlPage : prev));
    setPageSize((prev) => (prev !== urlPageSize ? urlPageSize : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Check if pending filters differ from applied filters
  const hasPendingChanges = () => {
    return (
      pendingFilters.dateFrom !== filters.dateFrom ||
      pendingFilters.dateTo !== filters.dateTo ||
      pendingFilters.status !== filters.status ||
      pendingFilters.plan !== filters.plan ||
      pendingFilters.paymentMethod !== filters.paymentMethod ||
      pendingFilters.search !== filters.search ||
      pendingFilters.freelancerId !== filters.freelancerId
    );
  };

  // Handle pending filter changes (doesn't trigger API calls)
  const handlePendingFiltersChange = (newFilters: TransactionFilters) => {
    setPendingFilters(newFilters);
  };

  // Apply filters - triggers API calls
  const applyFilters = () => {
    setFilters(pendingFilters);
    setSearchQuery(pendingFilters.search || '');
    setDebouncedSearch(pendingFilters.search || '');
    setPage(1); // Reset to first page when filters are applied
    updateUrlParams(pendingFilters, 1, pageSize);
  };

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters: TransactionFilters = {
      dateFrom: undefined,
      dateTo: undefined,
      status: 'all',
      plan: 'all',
      paymentMethod: 'all',
      search: undefined,
      freelancerId: undefined,
    };
    setPendingFilters(emptyFilters);
    setFilters(emptyFilters);
    setSearchQuery('');
    setPage(1);
    updateUrlParams(emptyFilters, 1, pageSize);
  };

  // Handle search change (updates pending filters)
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    handlePendingFiltersChange({ ...pendingFilters, search: value || undefined });
  };

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams(filters, newPage, pageSize);
  };

  // Handle page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when page size changes
    updateUrlParams(filters, 1, newPageSize);
  };

  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    isFetching: isFetchingTransactions,
  } = useAdminTransactions({
    ...filters,
    search: debouncedSearch || undefined,
    page,
    limit: pageSize,
  });

  // Stats query - will automatically refetch when dateFrom, dateTo, or freelancerId changes
  // because the query key includes these values
  const { data: stats, isLoading: isLoadingStats } = useTransactionStats({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    freelancerId: filters.freelancerId,
  });
  const { mutate: exportTransactions, isPending: isExporting } = useExportTransactions();

  const transactions = transactionsData?.transactions || [];
  const pagination = transactionsData?.pagination;

  const formatCurrency = (amount: number) => {
    return `EUR ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    exportTransactions({ filters, format });
  };

  const isLoading = isLoadingTransactions || isLoadingStats;
  const initialLoading = isLoading && !transactionsData && !stats;

  const statsCards = stats
    ? [
        {
          title: 'Total Revenue',
          value: formatCurrency(stats.totalRevenue),
        },
        {
          title: 'Total Transactions',
          value: stats.totalTransactions.toString(),
        },
        {
          title: 'Avg Transaction',
          value: formatCurrency(stats.averageTransactionValue),
        },
        {
          title: 'Net Revenue',
          value: formatCurrency(stats.netRevenue),
        },
        {
          title: 'Total Commission',
          value: formatCurrency(stats.totalCommission),
        },
      ]
    : [];

  return (
    <DashboardPageWrapper
      header={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
          <div>
            <h1 className="font-poppins font-bold text-2xl text-charcoal">Transaction History</h1>
            <p className="font-inter text-sm text-muted-foreground mt-1">
              View and manage all subscription transactions from freelancers
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')} disabled={isExporting}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')} disabled={isExporting}>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            return (
              <EnhancedStatCard
                key={index}
                title={stat.title}
                value={stat.value}
                loading={initialLoading}
              />
            );
          })}
        </div>

        {/* Transaction Table with Integrated Filters */}
        <div className="border rounded-lg">
          {/* Custom Filter Bar - Integrated with Table */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 border-b bg-gray-50/50">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Date From */}
              <Input
                type="date"
                value={pendingFilters.dateFrom || ''}
                onChange={(e) => {
                  handlePendingFiltersChange({
                    ...pendingFilters,
                    dateFrom: e.target.value || undefined,
                  });
                }}
                className="h-8 w-full sm:w-[130px] font-inter text-sm"
                placeholder="From"
              />
              {/* Date To */}
              <Input
                type="date"
                value={pendingFilters.dateTo || ''}
                onChange={(e) => {
                  handlePendingFiltersChange({
                    ...pendingFilters,
                    dateTo: e.target.value || undefined,
                  });
                }}
                className="h-8 w-full sm:w-[130px] font-inter text-sm"
                placeholder="To"
                min={pendingFilters.dateFrom || undefined}
              />
              {/* Status Filter */}
              <Select
                value={pendingFilters.status || 'all'}
                onValueChange={(value) => {
                  handlePendingFiltersChange({
                    ...pendingFilters,
                    status: value === 'all' ? 'all' : (value as TransactionFilters['status']),
                  });
                }}
              >
                <SelectTrigger className="h-8 w-full sm:w-[130px] border-gray-200 font-inter text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
              {/* Plan Filter */}
              <Select
                value={pendingFilters.plan || 'all'}
                onValueChange={(value) => {
                  handlePendingFiltersChange({
                    ...pendingFilters,
                    plan: value === 'all' ? 'all' : (value as TransactionFilters['plan']),
                  });
                }}
              >
                <SelectTrigger className="h-8 w-full sm:w-[130px] border-gray-200 font-inter text-sm">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="BRONZE">Bronze</SelectItem>
                  <SelectItem value="SILVER">Silver</SelectItem>
                  <SelectItem value="GOLD">Gold</SelectItem>
                </SelectContent>
              </Select>
              {/* Payment Method Filter */}
              <Select
                value={pendingFilters.paymentMethod || 'all'}
                onValueChange={(value) => {
                  handlePendingFiltersChange({
                    ...pendingFilters,
                    paymentMethod: value === 'all' ? 'all' : value,
                  });
                }}
              >
                <SelectTrigger className="h-8 w-full sm:w-[130px] border-gray-200 font-inter text-sm">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {/* Apply Filters Button */}
              <Button
                onClick={applyFilters}
                size="sm"
                className="h-8 px-4 font-inter text-sm"
                disabled={!hasPendingChanges()}
              >
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
              {/* Clear Filters Button */}
              {(pendingFilters.dateFrom ||
                pendingFilters.dateTo ||
                pendingFilters.status !== 'all' ||
                pendingFilters.plan !== 'all' ||
                pendingFilters.paymentMethod !== 'all' ||
                pendingFilters.search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-3 font-inter text-sm"
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* DataTable - Remove its border to integrate with wrapper */}
          <div className="[&>div]:border-0 [&>div]:rounded-none [&>div]:shadow-none">
            <TransactionTable
              transactions={transactions}
              isLoading={isFetchingTransactions}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              page={page}
              pageSize={pageSize}
              totalPages={pagination?.totalPages || 1}
              searchValue={searchQuery}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search freelancer..."
            />
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
