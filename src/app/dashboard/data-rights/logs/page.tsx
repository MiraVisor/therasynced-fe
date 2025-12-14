'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyHealthDataLogsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to account settings with logs tab
    router.replace('/dashboard/account?tab=logs');
  }, [router]);

  return null;
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/authentication/sign-in');
      return;
    }
  }, [isAuthenticated, router]);

  const fetchLogs = async () => {
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
        // Convert to ISO 8601 format
        const date = new Date(startDate);
        date.setHours(0, 0, 0, 0);
        filters.startDate = date.toISOString();
      }

      if (endDate) {
        // Convert to ISO 8601 format
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
        setLogs(response.data);
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

  const handleFilterChange = () => {
    setPage(1);
    fetchLogs();
  };

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">My Health Data Access Logs</h1>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </DashboardPageWrapper>
  );
}
