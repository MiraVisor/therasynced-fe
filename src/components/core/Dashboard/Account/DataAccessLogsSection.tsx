'use client';

import { Calendar, Shield } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/common/DataTable/data-table';
import { userHealthDataLogsColumns } from '@/components/common/DataTable/health-data-logs-columns';
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
import { useMyHealthDataLogs } from '@/hooks/queries/useDataRights';
import { useAuthStore } from '@/stores/authStore';
import type { HealthDataLogsFilters } from '@/types/dataRights';

export function DataAccessLogsSection() {
  const { isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dataType, setDataType] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [accessTypeFilter, setAccessTypeFilter] = useState<string>('');

  const filters: HealthDataLogsFilters = {
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
    filters.dataType = dataType as HealthDataLogsFilters['dataType'];
  }

  if (action && action !== 'all') {
    filters.action = action as HealthDataLogsFilters['action'];
  }

  const {
    data: logsResponse,
    isLoading: loading,
    isFetching: _isFetching,
  } = useMyHealthDataLogs(isAuthenticated ? filters : undefined);
  const allLogs = logsResponse?.data || [];
  const pagination = logsResponse?.pagination || null;
  const initialLoading = loading && !logsResponse;

  // Apply client-side filters
  const logs = allLogs.filter((log) => {
    // Filter by role
    if (roleFilter && roleFilter !== 'all') {
      if (log.accessedByUser.role?.toUpperCase() !== roleFilter.toUpperCase()) {
        return false;
      }
    }

    // Filter by access type
    if (accessTypeFilter && accessTypeFilter !== 'all') {
      if (accessTypeFilter === 'self' && log.isSelfAccess !== true) {
        return false;
      }
      if (accessTypeFilter === 'third-party' && log.isSelfAccess === true) {
        return false;
      }
    }

    return true;
  });

  const handleFilterChange = () => {
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-gray-600 />
        <h3 className="text-lg font-poppins font-semibold text-gray-900
          Health Data Access Logs
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        View a record of all access to your health data. Self-access entries show when you accessed
        your own data. Third-party access (FREELANCER/ADMIN) indicates when healthcare professionals
        or administrators accessed your health information.
      </p>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
            <Label htmlFor="roleFilter" className="text-sm font-medium">
              Role
            </Label>
            <Select
              value={roleFilter || undefined}
              onValueChange={(value) => setRoleFilter(value === 'all' ? '' : value)}
            >
              <SelectTrigger id="roleFilter" className="mt-1">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="FREELANCER">FREELANCER</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="PATIENT">PATIENT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="accessTypeFilter" className="text-sm font-medium">
              Access Type
            </Label>
            <Select
              value={accessTypeFilter || undefined}
              onValueChange={(value) => setAccessTypeFilter(value === 'all' ? '' : value)}
            >
              <SelectTrigger id="accessTypeFilter" className="mt-1">
                <SelectValue placeholder="All Access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access</SelectItem>
                <SelectItem value="self">Self-Access</SelectItem>
                <SelectItem value="third-party">Third-Party</SelectItem>
              </SelectContent>
            </Select>
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
        columns={userHealthDataLogsColumns}
        data={logs}
        title="Access Logs"
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
