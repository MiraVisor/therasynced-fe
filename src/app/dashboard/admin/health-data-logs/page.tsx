'use client';

import { Calendar, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { adminHealthDataLogsColumns } from '@/components/common/DataTable/health-data-logs-columns';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
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
import { useAllHealthDataLogs } from '@/hooks/queries/useDataRights';
import { useAuthStore } from '@/stores/authStore';
import type { AdminHealthDataLogsFilters } from '@/types/dataRights';
import { ROLES } from '@/types/types';

export default function AdminHealthDataLogsPage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dataType, setDataType] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [accessedBy, setAccessedBy] = useState<string>('');

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

  if (startDate) {
    const date = new Date(startDate);
    date.setHours(0, 0, 0, 0);
    filters.startDate = date.toISOString();
  }

  if (endDate) {
    const date = new Date(endDate);
    date.setHours(23, 59, 59, 999);
    filters.endDate = date.toISOString();
  }

  if (dataType && dataType !== 'all') {
    filters.dataType = dataType as AdminHealthDataLogsFilters['dataType'];
  }

  if (action && action !== 'all') {
    filters.action = action as AdminHealthDataLogsFilters['action'];
  }

  if (userId) {
    filters.userId = userId;
  }

  if (accessedBy) {
    filters.accessedBy = accessedBy;
  }

  const { data: logsResponse, isLoading: loading, isFetching } = useAllHealthDataLogs(filters);
  const logs = logsResponse?.data || [];
  const pagination = logsResponse?.pagination || null;
  const initialLoading = loading && !logsResponse;

  const handleFilterChange = () => {
    setPage(1);
  };

  if (role !== ROLES.ADMIN) {
    return null;
  }

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Health Data Access Logs</h1>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
                min={startDate || undefined}
              />
            </div>
            <div>
              <Label htmlFor="dataType" className="text-sm font-medium">
                Data Type
              </Label>
              <Select
                value={dataType || undefined}
                onValueChange={(value) => setDataType(value === 'all' ? '' : value)}
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
            <div>
              <Label htmlFor="action" className="text-sm font-medium">
                Action
              </Label>
              <Select
                value={action || undefined}
                onValueChange={(value) => setAction(value === 'all' ? '' : value)}
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
            <div>
              <Label htmlFor="userId" className="text-sm font-medium">
                User ID (Data Owner)
              </Label>
              <Input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Filter by user ID"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="accessedBy" className="text-sm font-medium">
                Accessed By (User ID)
              </Label>
              <Input
                id="accessedBy"
                type="text"
                value={accessedBy}
                onChange={(e) => setAccessedBy(e.target.value)}
                placeholder="Filter by accessed by user ID"
                className="mt-1"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleFilterChange} variant="default" className="w-full md:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
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
