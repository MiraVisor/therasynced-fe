'use client';

import { Download, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { adminHealthDataLogsColumns } from '@/components/common/DataTable/health-data-logs-columns';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/button';
import { useAllHealthDataLogs } from '@/hooks/queries/useDataRights';
import { getAllHealthDataLogs } from '@/services/dataRightsService';
import { useAuthStore } from '@/stores/authStore';
import type { AdminHealthDataLogsFilters, HealthDataAccessLog } from '@/types/dataRights';
import { ROLES } from '@/types/types';

export default function AdminHealthDataLogsPage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/authentication/sign-in');
      return;
    }
    if (role && role !== ROLES.ADMIN) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
    }
  }, [isAuthenticated, role, router]);

  const filters: AdminHealthDataLogsFilters = {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };

  const {
    data: logsResponse,
    isLoading: loading,
    isFetching: _isFetching,
  } = useAllHealthDataLogs(filters);
  const logs = logsResponse?.data || [];
  const pagination = logsResponse?.pagination || null;
  const initialLoading = loading && !logsResponse;

  const handleExportLogs = async () => {
    try {
      // Export all logs (without pagination)
      const exportFilters: AdminHealthDataLogsFilters = {
        skip: 0,
        take: 10000, // Large number to get all matching records
      };

      toast.info('Exporting logs... This may take a moment.');

      const response = await getAllHealthDataLogs(exportFilters);
      const allLogs = response.data || [];

      // Convert logs to CSV format
      const csvHeaders = [
        'Timestamp',
        'Data Owner (User ID)',
        'Data Owner Name',
        'Data Owner Email',
        'Accessed By (User ID)',
        'Accessed By Name',
        'Accessed By Email',
        'Accessed By Role',
        'Data Type',
        'Action',
        'IP Address',
        'User Agent',
        'Purpose',
        'Is Self Access',
      ];

      const csvRows = allLogs.map((log: HealthDataAccessLog) => [
        log.accessedAt ? new Date(log.accessedAt).toISOString() : '',
        log.user?.id || '',
        log.user?.name || '',
        log.user?.email || '',
        log.accessedByUser?.id || '',
        log.accessedByUser?.name || '',
        log.accessedByUser?.email || '',
        log.accessedByUser?.role || '',
        log.dataType || '',
        log.action || '',
        log.ipAddress || '',
        log.userAgent || '',
        log.purpose || '',
        log.isSelfAccess ? 'Yes' : 'No',
      ]);

      // Escape CSV values
      const escapeCsvValue = (value: string | number | boolean) => {
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvContent = [
        csvHeaders.map(escapeCsvValue).join(','),
        ...csvRows.map((row) => row.map(escapeCsvValue).join(',')),
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `health-data-access-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${allLogs.length} log entries successfully`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to export logs. Please try again.';
      toast.error(errorMessage);
      console.error('Export error:', error);
    }
  };

  if (role !== ROLES.ADMIN) {
    return null;
  }

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Health Data Access Logs</h1>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <p className="font-inter text-sm text-muted-foreground">
            View and export all health data access logs across the platform.
          </p>
          <Button onClick={handleExportLogs} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Logs (CSV)
          </Button>
        </div>

        {/* Data Table */}
        <DataTable
          columns={adminHealthDataLogsColumns}
          data={logs}
          title="All Access Logs"
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
    </DashboardPageWrapper>
  );
}
