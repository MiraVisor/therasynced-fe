'use client';

import { AlertTriangle, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { breachColumns } from '@/components/common/DataTable/breach-columns';
import { DataTable } from '@/components/common/DataTable/data-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useBreaches, useCreateBreach } from '@/hooks/queries/useDataRights';
import { type BreachFilters, BreachRiskLevel, BreachStatus } from '@/types/dataRights';

import { DistributionChart } from './components/charts/DistributionChart';
import { TimelineChart } from './components/charts/TimelineChart';
import { DateRange, DateRangePresets } from './components/DateRangePresets';
import { StatCard, StatsCardsGrid } from './components/StatsCards';

export function BreachesTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Filters
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('');
  const [searchQuery] = useState<string>('');

  // Create breach dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    dataCategories: [] as string[],
    affectedUsers: 0,
    riskLevel: BreachRiskLevel.MEDIUM,
  });
  const [categoryInput, setCategoryInput] = useState('');

  // Common data categories for easy selection
  const commonDataCategories = [
    'Personal Information',
    'Health Data',
    'Contact Information',
    'Financial Information',
    'Identity Documents',
    'Login Credentials',
    'Payment Information',
    'Medical Records',
    'Email Addresses',
    'Phone Numbers',
    'Addresses',
    'Date of Birth',
  ];

  const filters: BreachFilters = {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };

  if (statusFilter && statusFilter !== 'all') {
    filters.status = statusFilter as BreachStatus;
  }

  if (riskLevelFilter && riskLevelFilter !== 'all') {
    filters.riskLevel = riskLevelFilter as BreachRiskLevel;
  }

  const {
    data: breachesResponse,
    isLoading: loading,
    isFetching: _isFetching,
  } = useBreaches(filters);
  const allBreaches = breachesResponse?.data || [];
  const pagination = breachesResponse?.pagination || null;
  const initialLoading = loading && !breachesResponse;

  const createBreachMutation = useCreateBreach();

  // Apply client-side filters
  const breaches = allBreaches.filter((breach) => {
    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      const detectedDate = new Date(breach.detectedAt);
      if (dateRange.from && detectedDate < dateRange.from) return false;
      if (dateRange.to && detectedDate > dateRange.to) return false;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (
        !breach.description.toLowerCase().includes(query) &&
        !breach.dataCategories.some((cat) => cat.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    return true;
  });

  useEffect(() => {
    if (dateRange.from || dateRange.to || statusFilter || riskLevelFilter || searchQuery) {
      setPage(1);
    }
  }, [dateRange, statusFilter, riskLevelFilter, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = breaches.length;
    const active = breaches.filter((b) => b.status !== BreachStatus.RESOLVED).length;
    const criticalHigh = breaches.filter(
      (b) => b.riskLevel === BreachRiskLevel.CRITICAL || b.riskLevel === BreachRiskLevel.HIGH,
    ).length;
    const needsDpcNotification = breaches.filter(
      (b) =>
        (b.riskLevel === BreachRiskLevel.HIGH || b.riskLevel === BreachRiskLevel.CRITICAL) &&
        !b.reportedToDpc,
    ).length;

    // Calculate average resolution time
    const resolvedBreaches = breaches.filter((b) => b.status === BreachStatus.RESOLVED);
    let avgResolutionTime = 0;
    if (resolvedBreaches.length > 0) {
      const totalDays = resolvedBreaches.reduce((sum, b) => {
        const detected = new Date(b.detectedAt);
        const resolved = b.notifiedAt ? new Date(b.notifiedAt) : new Date(b.updatedAt);
        return sum + Math.ceil((resolved.getTime() - detected.getTime()) / (1000 * 60 * 60 * 24));
      }, 0);
      avgResolutionTime = Math.round(totalDays / resolvedBreaches.length);
    }

    return {
      total,
      active,
      criticalHigh,
      needsDpcNotification,
      avgResolutionTime,
    };
  }, [breaches]);

  // Prepare chart data
  const timelineData = useMemo(() => {
    const grouped = breaches.reduce(
      (acc, breach) => {
        const date = new Date(breach.detectedAt).toISOString().split('T')[0];
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
  }, [breaches]);

  const statusDistribution = useMemo(() => {
    const grouped = breaches.reduce(
      (acc, breach) => {
        acc[breach.status] = (acc[breach.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const statusColors: Record<string, string> = {
      DETECTED: '#ef4444', // Red
      INVESTIGATING: '#f59e0b', // Amber
      CONTAINED: '#3b82f6', // Blue
      RESOLVED: '#10b981', // Green
    };

    return Object.entries(grouped).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
      color: statusColors[name] || undefined,
    }));
  }, [breaches]);

  // Unused variable removed - was: const _riskDistribution = useMemo(() => { ... }, [breaches]);

  const handleAddCategory = () => {
    if (categoryInput.trim() && !formData.dataCategories.includes(categoryInput.trim())) {
      setFormData({
        ...formData,
        dataCategories: [...formData.dataCategories, categoryInput.trim()],
      });
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setFormData({
      ...formData,
      dataCategories: formData.dataCategories.filter((c) => c !== category),
    });
  };

  const handleCreateBreach = async () => {
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (formData.dataCategories.length === 0) {
      toast.error('At least one data category is required');
      return;
    }
    if (formData.affectedUsers < 1) {
      toast.error('Affected users must be at least 1');
      return;
    }

    try {
      await createBreachMutation.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      setFormData({
        description: '',
        dataCategories: [],
        affectedUsers: 0,
        riskLevel: BreachRiskLevel.MEDIUM,
      });
      setCategoryInput('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCardsGrid>
        <StatCard title="Total Breaches" value={stats.total} loading={initialLoading} />
        <StatCard title="Active Breaches" value={stats.active} loading={initialLoading} />
        <StatCard title="Critical/High Risk" value={stats.criticalHigh} loading={initialLoading} />
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
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select
              value={statusFilter || undefined}
              onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}
            >
              <SelectTrigger id="status" className="mt-1">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={BreachStatus.DETECTED}>Detected</SelectItem>
                <SelectItem value={BreachStatus.INVESTIGATING}>Investigating</SelectItem>
                <SelectItem value={BreachStatus.CONTAINED}>Contained</SelectItem>
                <SelectItem value={BreachStatus.RESOLVED}>Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <Label htmlFor="riskLevel" className="text-sm font-medium">
              Risk Level
            </Label>
            <Select
              value={riskLevelFilter || undefined}
              onValueChange={(value) => setRiskLevelFilter(value === 'all' ? '' : value)}
            >
              <SelectTrigger id="riskLevel" className="mt-1">
                <SelectValue placeholder="All Risk Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value={BreachRiskLevel.LOW}>Low</SelectItem>
                <SelectItem value={BreachRiskLevel.MEDIUM}>Medium</SelectItem>
                <SelectItem value={BreachRiskLevel.HIGH}>High</SelectItem>
                <SelectItem value={BreachRiskLevel.CRITICAL}>Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="font-inter">
            <Plus className="h-4 w-4 mr-2" />
            Create Breach
          </Button>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimelineChart data={timelineData} title="Breaches Over Time" loading={initialLoading} />
        <DistributionChart
          data={statusDistribution}
          title="Breaches by Status"
          loading={initialLoading}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={breachColumns}
        data={breaches}
        title="Data Breaches"
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

      {/* Create Breach Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-poppins font-semibold">Create Data Breach</DialogTitle>
            <DialogDescription className="font-open-sans">
              Record a new data breach incident. This will create a breach record that can be
              tracked through the compliance workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description" className="font-inter font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the data breach incident..."
                className="font-open-sans mt-2"
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="dataCategories" className="font-inter font-medium">
                Data Categories *
              </Label>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !formData.dataCategories.includes(value)) {
                        setFormData({
                          ...formData,
                          dataCategories: [...formData.dataCategories, value],
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="font-open-sans flex-1">
                      <SelectValue placeholder="Select a common category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        Common Categories
                      </div>
                      {commonDataCategories
                        .filter((cat) => !formData.dataCategories.includes(cat))
                        .map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 flex-1">
                    <Input
                      id="dataCategories"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      placeholder="Or type a custom category..."
                      className="font-open-sans"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCategory();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddCategory} variant="outline">
                      Add
                    </Button>
                  </div>
                </div>
                {formData.dataCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.dataCategories.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-md"
                      >
                        <span className="font-inter text-sm">{category}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(category)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Select from common categories or type a custom one. Examples: Personal Information,
                Health Data, Email Addresses, Payment Information
              </p>
            </div>
            <div>
              <Label htmlFor="affectedUsers" className="font-inter font-medium">
                Affected Users *
              </Label>
              <Input
                id="affectedUsers"
                type="number"
                min="1"
                value={formData.affectedUsers || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    affectedUsers: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="e.g., 150, 1000, 5000"
                className="font-open-sans mt-2"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the number of users affected. If exact number is unknown, provide your best
                estimate (e.g., &quot;approximately 150 users&quot; or &quot;between 100-200
                users&quot;).
              </p>
            </div>
            <div>
              <Label htmlFor="riskLevel" className="font-inter font-medium">
                Risk Level *
              </Label>
              <Select
                value={formData.riskLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, riskLevel: value as BreachRiskLevel })
                }
              >
                <SelectTrigger className="font-open-sans mt-2">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BreachRiskLevel.LOW}>Low</SelectItem>
                  <SelectItem value={BreachRiskLevel.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={BreachRiskLevel.HIGH}>High</SelectItem>
                  <SelectItem value={BreachRiskLevel.CRITICAL}>Critical</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                <strong>Low:</strong> Minimal impact, no sensitive data exposed.{' '}
                <strong>Medium:</strong> Some sensitive data, limited scope. <strong>High:</strong>{' '}
                Significant sensitive data exposed, requires DPC notification within 72 hours.{' '}
                <strong>Critical:</strong> Large-scale breach with highly sensitive data, immediate
                action required.
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-semibold mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>All breaches must be reported to the DPC within 72 hours if high risk</li>
                    <li>Affected users must be notified without undue delay</li>
                    <li>Update the breach status as you progress through the workflow</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setFormData({
                  description: '',
                  dataCategories: [],
                  affectedUsers: 0,
                  riskLevel: BreachRiskLevel.MEDIUM,
                });
                setCategoryInput('');
              }}
              disabled={createBreachMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateBreach} disabled={createBreachMutation.isPending}>
              {createBreachMutation.isPending ? 'Creating...' : 'Create Breach'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
