'use client';

import { Calendar, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

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
import {
  HealthDataAccessLog,
  HealthDataLogsFilters,
  getMyHealthDataLogs,
} from '@/redux/api/dataRightsApi';
import { useAuth } from '@/redux/hooks/useAppHooks';

export function DataAccessLogsSection() {
  const { isAuthenticated } = useAuth();
  const [logs, setLogs] = useState<HealthDataAccessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState<{
    skip: number;
    take: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);

  // Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dataType, setDataType] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [accessTypeFilter, setAccessTypeFilter] = useState<string>('');
  const [allLogs, setAllLogs] = useState<HealthDataAccessLog[]>([]); // Store all logs for client-side filtering

  const fetchLogs = async () => {
    if (!isAuthenticated) return;

    try {
      if (initialLoading) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }

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

      const response = await getMyHealthDataLogs(filters);

      if (response.success) {
        setAllLogs(response.data);
        // Apply client-side filters
        applyClientFilters(response.data);
        setPagination(response.pagination);
      }
    } catch (error: any) {
      console.error('Failed to fetch health data logs:', error);
      toast.error(error?.message || 'Failed to load access logs. Please try again.');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, isAuthenticated]);

  const applyClientFilters = (data: HealthDataAccessLog[]) => {
    let filtered = [...data];

    // Filter by role
    if (roleFilter && roleFilter !== 'all') {
      filtered = filtered.filter(
        (log) => log.accessedByUser.role?.toUpperCase() === roleFilter.toUpperCase(),
      );
    }

    // Filter by access type
    if (accessTypeFilter && accessTypeFilter !== 'all') {
      if (accessTypeFilter === 'self') {
        filtered = filtered.filter((log) => log.isSelfAccess === true);
      } else if (accessTypeFilter === 'third-party') {
        filtered = filtered.filter((log) => log.isSelfAccess !== true);
      }
    }

    setLogs(filtered);
  };

  const handleFilterChange = () => {
    setPage(1);
    fetchLogs();
  };

  // Apply client-side filters when role or access type filter changes
  useEffect(() => {
    if (allLogs.length > 0) {
      applyClientFilters(allLogs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, accessTypeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white">
          Health Data Access Logs
        </h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        View a record of all access to your health data. Self-access entries show when you accessed
        your own data. Third-party access (FREELANCER/ADMIN) indicates when healthcare professionals
        or administrators accessed your health information.
      </p>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
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

