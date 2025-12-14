'use client';

import { Download, FileDown, Lock, TrendingUp, Unlock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { exportLogsColumns } from '@/components/common/DataTable/export-logs-columns';
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
  getExportLogs,
  exportExportLogsToCSV,
  type ExportLog,
  type ExportLogFilters,
} from '@/services/exportService';

export function ExportLogsTab() {
  const [logs, setLogs] = useState<ExportLog[]>([]);
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
  const [exportTypeFilter, setExportTypeFilter] = useState<string>('');
  const [formatFilter, setFormatFilter] = useState<string>('');
  const [encryptionFilter, setEncryptionFilter] = useState<string>('');
  const [exportedByFilter, setExportedByFilter] = useState<string>('');
  const [exportedUserFilter, setExportedUserFilter] = useState<string>('');
  const [requestReferenceFilter, setRequestReferenceFilter] = useState<string>('');

  const fetchLogs = async () => {
    try {
      if (initialLoading) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }

      const filters: ExportLogFilters = {
        skip: (page - 1) * pageSize,
        take: pageSize,
      };

      if (dateRange.from) {
        const date = new Date(dateRange.from);
        date.setHours(0, 0, 0, 0);
        filters.startDate = date.toISOString();
      }

      if (dateRange.to) {
        const date = new Date(dateRange.to);
        date.setHours(23, 59, 59, 999);
        filters.endDate = date.toISOString();
      }

      if (exportTypeFilter && exportTypeFilter !== 'all') {
        filters.exportType = exportTypeFilter as 'ADMIN' | 'USER';
      }

      if (exportedByFilter) {
        filters.exportedBy = exportedByFilter;
      }

      if (exportedUserFilter) {
        filters.exportedUserId = exportedUserFilter;
      }

      if (requestReferenceFilter.trim()) {
        filters.requestReference = requestReferenceFilter.trim();
      }

      const response = await getExportLogs(filters);

      if (response.success) {
        let filteredLogs = response.data || [];

        // Apply client-side filters
        if (formatFilter && formatFilter !== 'all') {
          filteredLogs = filteredLogs.filter((log) => {
            const logFormat = log.format?.toLowerCase();
            return logFormat === formatFilter.toLowerCase();
          });
        }

        if (encryptionFilter === 'encrypted') {
          filteredLogs = filteredLogs.filter((log) => log.isEncrypted === true || log.encrypted === true);
        } else if (encryptionFilter === 'unencrypted') {
          filteredLogs = filteredLogs.filter((log) => log.isEncrypted === false && log.encrypted !== true);
        }

        setLogs(filteredLogs);
        setPagination(
          response.pagination || {
            skip: 0,
            take: pageSize,
            total: filteredLogs.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        );
      } else {
        console.warn('Export logs API returned success=false:', response);
        setLogs([]);
        setPagination(null);
      }
    } catch (error: any) {
      console.error('Failed to fetch export logs:', error);
      console.error('Error details:', {
        status: error?.status,
        statusText: error?.statusText,
        response: error?.response?.data,
        message: error?.message,
      });

      // If it's a 404, the endpoint might not exist yet
      if (error?.status === 404) {
        toast.error('Export logs endpoint not found. The backend may not have this feature implemented yet.');
      } else if (error?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error(error?.message || 'Failed to load export logs. Please try again.');
      }

      setLogs([]);
      setPagination(null);
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
    if (dateRange.from || dateRange.to || exportTypeFilter) {
      const timer = setTimeout(() => {
        setPage(1);
        fetchLogs();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, exportTypeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!logs || logs.length === 0) {
      return {
        total: 0,
        last30d: 0,
        encrypted: 0,
        unencrypted: 0,
        totalSizeGB: '0.00',
        adminExports: 0,
        userExports: 0,
      };
    }

    const total = logs.length;
    const last30d = logs.filter((log) => {
      const date = log.createdAt || log.exportedAt;
      if (!date) return false;
      try {
        const logDate = new Date(date);
        const now = new Date();
        return now.getTime() - logDate.getTime() < 30 * 24 * 60 * 60 * 1000;
      } catch {
        return false;
      }
    }).length;
    const encrypted = logs.filter((log) => log.isEncrypted === true || log.encrypted === true).length;
    const unencrypted = logs.filter((log) => !(log.isEncrypted === true || log.encrypted === true)).length;
    const totalSizeBytes = logs.reduce((sum, log) => sum + (log.fileSize || 0), 0);
    
    // Format size intelligently based on magnitude
    let totalSizeFormatted: string;
    if (totalSizeBytes >= 1024 * 1024 * 1024) {
      // >= 1 GB, show in GB
      const totalSizeGB = totalSizeBytes / (1024 * 1024 * 1024);
      totalSizeFormatted = `${totalSizeGB.toFixed(2)} GB`;
    } else if (totalSizeBytes >= 1024 * 1024) {
      // >= 1 MB, show in MB
      const totalSizeMB = totalSizeBytes / (1024 * 1024);
      totalSizeFormatted = `${totalSizeMB.toFixed(2)} MB`;
    } else if (totalSizeBytes >= 1024) {
      // >= 1 KB, show in KB
      const totalSizeKB = totalSizeBytes / 1024;
      totalSizeFormatted = `${totalSizeKB.toFixed(2)} KB`;
    } else {
      // < 1 KB, show in bytes
      totalSizeFormatted = `${totalSizeBytes} B`;
    }
    
    const adminExports = logs.filter((log) => log.exportType === 'ADMIN' || log.exportType === 'BULK_USER_DATA').length;
    const userExports = logs.filter((log) => log.exportType === 'USER' || log.exportType === 'USER_DATA').length;

    return {
      total,
      last30d,
      encrypted,
      unencrypted,
      totalSizeGB: totalSizeFormatted,
      adminExports,
      userExports,
    };
  }, [logs]);

  // Prepare chart data
  const timelineData = useMemo(() => {
    if (!logs || logs.length === 0) {
      return [];
    }

    const grouped = logs.reduce((acc, log) => {
      const date = log.createdAt || log.exportedAt;
      if (!date) return acc;
      try {
        const dateStr = new Date(date).toISOString().split('T')[0];
        acc[dateStr] = (acc[dateStr] || 0) + 1;
      } catch {
        // Skip invalid dates
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [logs]);

  const typeDistribution = useMemo(() => {
    const admin = logs.filter((log) => log.exportType === 'ADMIN' || log.exportType === 'BULK_USER_DATA').length;
    const user = logs.filter((log) => log.exportType === 'USER' || log.exportType === 'USER_DATA').length;
    return [
      { name: 'Admin', value: admin },
      { name: 'User', value: user },
    ];
  }, [logs]);

  const formatDistribution = useMemo(() => {
    const json = logs.filter((log) => {
      const format = log.format?.toLowerCase();
      return format === 'json';
    }).length;
    const csv = logs.filter((log) => {
      const format = log.format?.toLowerCase();
      return format === 'csv';
    }).length;
    return [
      { name: 'JSON', value: json },
      { name: 'CSV', value: csv },
    ];
  }, [logs]);

  const encryptionDistribution = useMemo(() => {
    const encrypted = logs.filter((log) => log.isEncrypted === true || log.encrypted === true).length;
    const unencrypted = logs.filter((log) => !(log.isEncrypted === true || log.encrypted === true)).length;
    return [
      { name: 'Encrypted', value: encrypted },
      { name: 'Unencrypted', value: unencrypted },
    ];
  }, [logs]);

  const handleExportToCSV = async () => {
    try {
      const filters: ExportLogFilters = {};

      if (dateRange.from) {
        const date = new Date(dateRange.from);
        date.setHours(0, 0, 0, 0);
        // Format as YYYY-MM-DD for CSV endpoint
        filters.startDate = date.toISOString().split('T')[0];
      }

      if (dateRange.to) {
        const date = new Date(dateRange.to);
        date.setHours(23, 59, 59, 999);
        // Format as YYYY-MM-DD for CSV endpoint
        filters.endDate = date.toISOString().split('T')[0];
      }

      if (exportTypeFilter && exportTypeFilter !== 'all') {
        filters.exportType = exportTypeFilter as 'ADMIN' | 'USER';
      }

      if (exportedByFilter) {
        filters.exportedBy = exportedByFilter;
      }

      if (exportedUserFilter) {
        filters.exportedUserId = exportedUserFilter;
      }

      if (requestReferenceFilter.trim()) {
        filters.requestReference = requestReferenceFilter.trim();
      }

      // Use the new CSV endpoint that returns a CSV file directly
      // The backend ignores take parameter for CSV exports and returns all matching records
      const blob = await exportExportLogsToCSV({ ...filters, skip: 0, take: 10000 });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Export logs downloaded as CSV');
    } catch (error: any) {
      console.error('Failed to export logs:', error);
      if (error?.status === 404) {
        toast.error('CSV export endpoint not found. Please check backend configuration.');
      } else {
        toast.error(error?.message || 'Failed to export logs. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCardsGrid>
        <StatCard
          title="Total Exports"
          value={stats.total}
          icon={FileDown}
          loading={initialLoading}
        />
        <StatCard
          title="Last 30 Days"
          value={stats.last30d}
          icon={TrendingUp}
          loading={initialLoading}
        />
        <StatCard
          title="Total Data Exported"
          value={stats.totalSizeGB}
          icon={Download}
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
            <Label htmlFor="exportType" className="text-sm font-medium">
              Export Type
            </Label>
            <Select
              value={exportTypeFilter || undefined}
              onValueChange={(value) => setExportTypeFilter(value === 'all' ? '' : value)}
            >
              <SelectTrigger id="exportType" className="mt-1">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleExportToCSV}
            variant="outline"
            className="font-inter"
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Visualizations */}
      <TimelineChart
        data={timelineData}
        title="Export Volume Over Time"
        loading={initialLoading}
      />

      {/* Data Table */}
      <DataTable
        columns={exportLogsColumns}
        data={logs}
        title="Export Logs"
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
