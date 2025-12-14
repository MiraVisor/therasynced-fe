'use client';

import { AlertTriangle, Eye, TrendingUp, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { adminHealthDataLogsColumns } from '@/components/common/DataTable/health-data-logs-columns';
import { UserSearchSelect } from '@/components/common/UserSearchSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TimelineChart } from './components/charts/TimelineChart';
import { DateRangePresets, DateRange } from './components/DateRangePresets';
import { StatCard, StatsCardsGrid } from './components/StatsCards';
import {
  AdminHealthDataLogsFilters,
  getAllHealthDataLogs,
  HealthDataAccessLog,
} from '@/redux/api/dataRightsApi';

export function AccessLogsTab() {
  const [logs, setLogs] = useState<HealthDataAccessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [pagination, setPagination] = useState<{
    skip: number;
    take: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);

  // Filters
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [dataTypeFilter, setDataTypeFilter] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [userIdFilter, setUserIdFilter] = useState<string>('');
  const [accessedByFilter, setAccessedByFilter] = useState<string>('');
  const [selfAccessFilter, setSelfAccessFilter] = useState<string>('');
  const [ipAddressFilter, setIpAddressFilter] = useState<string>('');
  const [purposeFilter, setPurposeFilter] = useState<string>('');

  const fetchLogs = async () => {
    try {
      if (initialLoading) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }

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

      const response = await getAllHealthDataLogs(filters);

      if (response.success) {
        let filteredLogs = response.data;

        // Apply client-side filters
        if (selfAccessFilter === 'self') {
          filteredLogs = filteredLogs.filter((log) => log.isSelfAccess === true);
        } else if (selfAccessFilter === 'third-party') {
          filteredLogs = filteredLogs.filter((log) => log.isSelfAccess !== true);
        }

        if (ipAddressFilter.trim()) {
          const ipQuery = ipAddressFilter.toLowerCase();
          filteredLogs = filteredLogs.filter(
            (log) => log.ipAddress?.toLowerCase().includes(ipQuery),
          );
        }

        if (purposeFilter.trim()) {
          const purposeQuery = purposeFilter.toLowerCase();
          filteredLogs = filteredLogs.filter((log) =>
            log.purpose.toLowerCase().includes(purposeQuery),
          );
        }

        setLogs(filteredLogs);
        setPagination(response.pagination);
      }
    } catch (error: any) {
      console.error('Failed to fetch access logs:', error);
      toast.error(error?.message || 'Failed to load access logs. Please try again.');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  useEffect(() => {
    if (dateRange.from || dateRange.to || dataTypeFilter || actionFilter) {
      const timer = setTimeout(() => {
        setPage(1);
        fetchLogs();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const dataTypeCounts = logs.reduce((acc, log) => {
      acc[log.dataType] = (acc[log.dataType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostAccessedType = Object.entries(dataTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

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
    const grouped = logs.reduce((acc, log) => {
      const date = new Date(log.accessedAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [logs]);

  const dataTypeDistribution = useMemo(() => {
    const grouped = logs.reduce((acc, log) => {
      acc[log.dataType] = (acc[log.dataType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({
      name: name.replace('-', ' '),
      value,
    }));
  }, [logs]);

  const actionDistribution = useMemo(() => {
    const grouped = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    }));
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCardsGrid>
        <StatCard
          title="Total Access Events"
          value={stats.total}
          icon={Eye}
          loading={initialLoading}
        />
        <StatCard
          title="Third-Party Accesses"
          value={stats.thirdParty}
          icon={AlertTriangle}
          loading={initialLoading}
        />
        <StatCard
          title="Last 7 Days"
          value={stats.last7d}
          icon={TrendingUp}
          loading={initialLoading}
        />
      </StatsCardsGrid>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
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
      <TimelineChart
        data={timelineData}
        title="Access Events Over Time"
        loading={initialLoading}
      />

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
