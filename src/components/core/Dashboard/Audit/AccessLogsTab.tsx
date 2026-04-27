'use client';

import { useEffect, useMemo, useState } from 'react';

import { DataTable } from '@/components/common/DataTable/data-table';
import { adminHealthDataLogsColumns } from '@/components/common/DataTable/health-data-logs-columns';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAllHealthDataLogs } from '@/hooks/queries/useDataRights';
import type { AdminHealthDataLogsFilters } from '@/types/dataRights';

import { TimelineChart } from './components/charts/TimelineChart';
import { DateRange, DateRangePresets } from './components/DateRangePresets';
import { StatCard, StatsCardsGrid } from './components/StatsCards';

export function AccessLogsTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Filters
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [dataTypeFilter, setDataTypeFilter] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [userIdFilter] = useState<string>('');
  const [accessedByFilter] = useState<string>('');
  const [selfAccessFilter] = useState<string>('');
  const [ipAddressFilter] = useState<string>('');
  const [purposeFilter] = useState<string>('');

  const filters: AdminHealthDataLogsFilters = {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };

  if (dateRange.from) {
    filters.startDate = dateRange.from.toISOString();
  }
  if (dateRange.to) {
    const endDate = new Date(dateRange.to);
    endDate.setHours(23, 59, 59, 999);
    filters.endDate = endDate.toISOString();
  }

  if (dataTypeFilter && dataTypeFilter !== 'all') {
    filters.dataType = dataTypeFilter as any;
  }

  if (actionFilter && actionFilter !== 'all') {
    filters.action = actionFilter as any;
  }

  if (userIdFilter) {
    filters.userId = userIdFilter;
  }

  if (accessedByFilter) {
    filters.accessedBy = accessedByFilter;
  }

  const {
    data: logsResponse,
    isLoading: loading,
    isFetching: _isFetching,
  } = useAllHealthDataLogs(filters);
  const allLogs = logsResponse?.data || [];
  const pagination = logsResponse?.pagination || null;
  const initialLoading = loading && !logsResponse;

  // Apply client-side filters
  const logs = allLogs.filter((log) => {
    if (selfAccessFilter === 'self' && log.isSelfAccess !== true) {
      return false;
    }
    if (selfAccessFilter === 'third-party' && log.isSelfAccess === true) {
      return false;
    }

    if (ipAddressFilter.trim()) {
      const ipQuery = ipAddressFilter.toLowerCase();
      if (!log.ipAddress?.toLowerCase().includes(ipQuery)) {
        return false;
      }
    }

    if (purposeFilter.trim()) {
      const purposeQuery = purposeFilter.toLowerCase();
      if (!log.purpose.toLowerCase().includes(purposeQuery)) {
        return false;
      }
    }

    return true;
  });

  useEffect(() => {
    if (dateRange.from || dateRange.to || dataTypeFilter || actionFilter) {
      setPage(1);
    }
  }, [dateRange, dataTypeFilter, actionFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const thirdParty = logs.filter((log) => !log.isSelfAccess).length;
    const uniqueUsers = new Set(logs.map((log) => log.userId)).size;
    const last24h = logs.filter((log) => {
      const logDate = new Date(log.accessedAt);
      const now = new Date();
      return now.getTime() - logDate.getTime() < 24 * 60 * 60 * 1000;
    }).length;
    const last7d = logs.filter((log) => {
      const logDate = new Date(log.accessedAt);
      const now = new Date();
      return now.getTime() - logDate.getTime() < 7 * 24 * 60 * 60 * 1000;
    }).length;

    // Most accessed data type
    const dataTypeCounts = logs.reduce(
      (acc, log) => {
        acc[log.dataType] = (acc[log.dataType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const mostAccessedType =
      Object.entries(dataTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      total,
      thirdParty,
      uniqueUsers,
      last24h,
      last7d,
      mostAccessedType,
    };
  }, [logs]);

  // Prepare chart data
  const timelineData = useMemo(() => {
    const grouped = logs.reduce(
      (acc, log) => {
        const date = new Date(log.accessedAt).toISOString().split('T')[0];
        if (date) {
          acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(grouped)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [logs]);

  // Unused variable removed - was: const _dataTypeDistribution = useMemo(() => { ... }, [logs]);

  // Unused variable removed - was: const _actionDistribution = useMemo(() => { ... }, [logs]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCardsGrid>
        <StatCard title="Total Access Events" value={stats.total} loading={initialLoading} />
        <StatCard title="Third-Party Accesses" value={stats.thirdParty} loading={initialLoading} />
        <StatCard title="Last 7 Days" value={stats.last7d} loading={initialLoading} />
      </StatsCardsGrid>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="dateRange" className="text-sm font-medium">
              Date Range
            </Label>
            <DateRangePresets value={dateRange} onChange={setDateRange} className="mt-1" />
          </div>
          <div className="w-[180px]">
            <Label htmlFor="dataType" className="text-sm font-medium">
              Data Type
            </Label>
            <Select
              value={dataTypeFilter || undefined}
              onValueChange={(value) => setDataTypeFilter(value === 'all' ? '' : value)}
            >
              <SelectTrigger id="dataType" className="mt-1">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="booking">Booking</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
                <SelectItem value="consent">Consent</SelectItem>
                <SelectItem value="data-rights">Data Rights</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <Label htmlFor="action" className="text-sm font-medium">
              Action
            </Label>
            <Select
              value={actionFilter || undefined}
              onValueChange={(value) => setActionFilter(value === 'all' ? '' : value)}
            >
              <SelectTrigger id="action" className="mt-1">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="ACCESS">Access</SelectItem>
                <SelectItem value="EDIT">Edit</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Visualizations */}
      <TimelineChart data={timelineData} title="Access Events Over Time" loading={initialLoading} />

      {/* Data Table */}
      <DataTable
        columns={adminHealthDataLogsColumns}
        data={logs}
        title="Data Access Logs"
        enableSorting={true}
        enableFiltering={false}
        enableColumnVisibility={true}
        enablePagination={true}
        showSearch={false}
        showSorting={true}
        initialLoading={initialLoading}
        loading={loading}
        externalPageIndex={page - 1}
        externalPageSize={pageSize}
        totalPages={pagination?.totalPages}
        onExternalPageChange={(pageIndex) => setPage(pageIndex + 1)}
        onExternalPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(1);
        }}
      />
    </div>
  );
}
