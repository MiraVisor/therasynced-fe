'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Calendar, CreditCard, MoreHorizontal, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DataTable } from '@/components/common/DataTable/data-table';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatsCardsSkeleton } from '@/components/ui/skeletons/StatsCardsSkeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  useAdminUserSubscriptions,
  useCancelUserSubscription,
  useManageTrialAccess,
  useResumeUserSubscription,
  useUpdateUserSubscriptionPlan,
} from '@/hooks/queries/useAdmin';
import type { UserSubscription } from '@/services/adminSubscriptionService';
import type { SubscriptionPlanType, SubscriptionStatus } from '@/types/types';

const UserSubscriptionsPage = () => {
  // State for pagination and search
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | undefined>(undefined);
  const [planFilter, setPlanFilter] = useState<SubscriptionPlanType | undefined>(undefined);

  // Dialog states
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isPlanChangeDialogOpen, setIsPlanChangeDialogOpen] = useState(false);
  const [isTrialDialogOpen, setIsTrialDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelImmediately, setCancelImmediately] = useState(false);
  const [newPlanType, setNewPlanType] = useState<SubscriptionPlanType>('BRONZE');
  const [trialGrant, setTrialGrant] = useState(true);
  const [trialReason, setTrialReason] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchQuery !== debouncedSearch) {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  // Fetch user subscriptions
  const {
    data: subscriptionsData,
    isLoading,
    isFetching,
    error,
  } = useAdminUserSubscriptions({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter,
    plan: planFilter,
  });

  const subscriptions = subscriptionsData?.data || [];
  const pagination = subscriptionsData?.pagination;

  // Mutations
  const cancelMutation = useCancelUserSubscription();
  const updatePlanMutation = useUpdateUserSubscriptionPlan();
  const resumeMutation = useResumeUserSubscription();
  const trialMutation = useManageTrialAccess();

  // Show error toast only when no cached data exists
  useEffect(() => {
    if (error && !subscriptionsData) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load user subscriptions';
      toast.error(errorMessage);
    }
  }, [error, subscriptionsData]);

  // Calculate stats
  const stats = subscriptionsData
    ? {
        total: subscriptionsData.pagination.total,
        active: subscriptions.filter((s) => s.status === 'ACTIVE').length,
        trialing: subscriptions.filter((s) => s.status === 'TRIALING').length,
        canceled: subscriptions.filter((s) => s.status === 'CANCELED' || s.cancelAtPeriodEnd)
          .length,
      }
    : {
        total: 0,
        active: 0,
        trialing: 0,
        canceled: 0,
      };

  const handleCancel = (subscription: UserSubscription) => {
    setSelectedSubscription(subscription);
    setCancelReason('');
    setCancelImmediately(false);
    setIsCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (!selectedSubscription) return;
    cancelMutation.mutate(
      {
        userId: selectedSubscription.userId,
        data: {
          reason: cancelReason.trim() || undefined,
          cancelImmediately,
        },
      },
      {
        onSuccess: () => {
          setIsCancelDialogOpen(false);
          setSelectedSubscription(null);
          setCancelReason('');
        },
      },
    );
  };

  const handlePlanChange = (subscription: UserSubscription) => {
    setSelectedSubscription(subscription);
    setNewPlanType(subscription.plan.name);
    setIsPlanChangeDialogOpen(true);
  };

  const handlePlanChangeConfirm = () => {
    if (!selectedSubscription) return;
    if (newPlanType === selectedSubscription.plan.name) {
      toast.info('User is already on this plan');
      return;
    }
    updatePlanMutation.mutate(
      {
        userId: selectedSubscription.userId,
        data: { planType: newPlanType },
      },
      {
        onSuccess: () => {
          setIsPlanChangeDialogOpen(false);
          setSelectedSubscription(null);
        },
      },
    );
  };

  const handleResume = (subscription: UserSubscription) => {
    resumeMutation.mutate(subscription.userId);
  };

  const handleTrialAccess = (subscription: UserSubscription) => {
    setSelectedSubscription(subscription);
    setTrialGrant(true);
    setTrialReason('');
    setIsTrialDialogOpen(true);
  };

  const handleTrialConfirm = () => {
    if (!selectedSubscription) return;
    trialMutation.mutate(
      {
        userId: selectedSubscription.userId,
        data: {
          grant: trialGrant,
          reason: trialReason.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsTrialDialogOpen(false);
          setSelectedSubscription(null);
          setTrialReason('');
        },
      },
    );
  };

  const getStatusBadgeConfig = (status: SubscriptionStatus, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) {
      return {
        label: 'Canceling at period end',
        className: 'bg-warning/10 text-warning border-warning/20',
        variant: 'outline' as const,
      };
    }

    switch (status) {
      case 'ACTIVE':
        return {
          label: 'Active',
          className: 'bg-success/10 text-success border-success/20',
          variant: 'outline' as const,
        };
      case 'TRIALING':
        return {
          label: 'Trialing',
          className: 'bg-blue-100 text-blue-800 border-blue-300',
          variant: 'outline' as const,
        };
      case 'CANCELED':
        return {
          label: 'Canceled',
          className: 'bg-muted text-muted-foreground border-muted',
          variant: 'outline' as const,
        };
      case 'PAST_DUE':
        return {
          label: 'Past Due',
          className: 'bg-error/10 text-error border-error/20',
          variant: 'outline' as const,
        };
      case 'UNPAID':
        return {
          label: 'Unpaid',
          className: 'bg-error/10 text-error border-error/20',
          variant: 'outline' as const,
        };
      default:
        return {
          label: status,
          className: 'bg-muted text-muted-foreground border-muted',
          variant: 'outline' as const,
        };
    }
  };

  // Filter options for DataTable
  const statusFilterOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Active', value: 'ACTIVE', color: 'success' },
    { label: 'Trialing', value: 'TRIALING', color: 'primary' },
    { label: 'Canceled', value: 'CANCELED', color: 'error' },
    { label: 'Past Due', value: 'PAST_DUE', color: 'warning' },
    { label: 'Unpaid', value: 'UNPAID', color: 'error' },
  ];

  // Column definitions
  const columns: ColumnDef<UserSubscription>[] = [
    {
      accessorKey: 'user.name',
      header: 'Freelancer',
      cell: ({ row }) => (
        <div>
          <div className="font-inter font-medium text-charcoal">{row.original.user.name}</div>
          <div className="font-inter text-xs text-muted-foreground">{row.original.user.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'plan.displayName',
      header: 'Plan',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-inter text-xs px-2 py-1">
          {row.original.plan.displayName}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const subscription = row.original;
        const config = getStatusBadgeConfig(subscription.status, subscription.cancelAtPeriodEnd);
        return (
          <Badge
            variant={config.variant}
            className={`font-inter font-medium text-xs px-2.5 py-1 border ${config.className}`}
          >
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'currentPeriodEnd',
      header: 'Period End',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 font-inter text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date(row.original.currentPeriodEnd).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const subscription = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {subscription.cancelAtPeriodEnd ? (
                <DropdownMenuItem onClick={() => handleResume(subscription)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resume Subscription
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => handlePlanChange(subscription)}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Change Plan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCancel(subscription)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel Subscription
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => handleTrialAccess(subscription)}>
                <CreditCard className="h-4 w-4 mr-2" />
                {subscription.status === 'TRIALING' ? 'Revoke Trial' : 'Grant Trial'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const statCards = [
    {
      title: 'Total Subscriptions',
      value: stats.total.toString(),
    },
    {
      title: 'Active',
      value: stats.active.toString(),
    },
    {
      title: 'Trialing',
      value: stats.trialing.toString(),
    },
    {
      title: 'Canceled',
      value: stats.canceled.toString(),
    },
  ];

  return (
    <DashboardPageWrapper
      header={
        <div>
          <h1 className="font-poppins font-bold text-2xl text-charcoal">User Subscriptions</h1>
          <p className="font-inter text-sm text-muted-foreground">
            Manage freelancer subscriptions and plans
          </p>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        {isLoading && !subscriptionsData ? (
          <StatsCardsSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <EnhancedStatCard key={stat.title} title={stat.title} value={stat.value} />
            ))}
          </div>
        )}

        {/* Subscriptions Table */}
        <div className="border rounded-lg">
          {/* Filter Bar - Integrated with Table */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 border-b bg-gray-50/50">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Plan Filter */}
              <Select
                value={planFilter || 'all'}
                onValueChange={(value) => {
                  setPlanFilter(value === 'all' ? undefined : (value as SubscriptionPlanType));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-full sm:w-[140px] border-gray-200 font-inter text-sm">
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="BRONZE">Bronze</SelectItem>
                  <SelectItem value="SILVER">Silver</SelectItem>
                  <SelectItem value="GOLD">Gold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* DataTable - Remove its border to integrate with wrapper */}
          <div className="[&>div]:border-0 [&>div]:rounded-none [&>div]:shadow-none">
            <DataTable
              columns={columns}
              data={subscriptions}
              title="All Subscriptions"
              searchKey="user.name"
              searchPlaceholder="Search by name or email..."
              enableSorting={false}
              enableFiltering={true}
              enableColumnVisibility={true}
              enablePagination={true}
              showSearch={true}
              showSorting={false}
              initialLoading={isLoading && !subscriptions.length}
              loading={isFetching}
              externalSearchValue={searchQuery}
              onExternalSearchChange={(value) => setSearchQuery(value)}
              externalPageIndex={page - 1}
              externalPageSize={pageSize}
              totalPages={pagination?.totalPages}
              onExternalPageChange={(pageIndex) => setPage(pageIndex + 1)}
              onExternalPageSizeChange={(newPageSize) => {
                setPageSize(newPageSize);
                setPage(1);
              }}
              filterOptions={statusFilterOptions.map((opt) => ({
                label: opt.label,
                value: opt.value,
                color: opt.color,
              }))}
              selectedFilter={statusFilter || 'all'}
              onFilterChange={(value) => {
                setStatusFilter(value === 'all' ? undefined : (value as SubscriptionStatus));
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Cancel Subscription Dialog */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">Cancel Subscription</DialogTitle>
              <DialogDescription className="font-inter">
                Cancel {selectedSubscription?.user.name}'s subscription
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="cancel-immediately"
                  checked={cancelImmediately}
                  onChange={(e) => setCancelImmediately(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="cancel-immediately" className="font-inter font-medium">
                  Cancel immediately (otherwise cancels at period end)
                </Label>
              </div>
              <div>
                <Label htmlFor="cancel-reason" className="font-inter font-medium">
                  Reason (Optional)
                </Label>
                <Textarea
                  id="cancel-reason"
                  placeholder="Enter reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCancelConfirm}
                disabled={cancelMutation.isPending}
                variant="destructive"
              >
                {cancelMutation.isPending ? 'Canceling...' : 'Cancel Subscription'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Plan Dialog */}
        <Dialog open={isPlanChangeDialogOpen} onOpenChange={setIsPlanChangeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">
                Change Subscription Plan
              </DialogTitle>
              <DialogDescription className="font-inter">
                Update {selectedSubscription?.user.name}'s subscription plan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="plan-type" className="font-inter font-medium">
                  New Plan
                </Label>
                <Select
                  value={newPlanType}
                  onValueChange={(value) => setNewPlanType(value as SubscriptionPlanType)}
                >
                  <SelectTrigger id="plan-type" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRONZE">Bronze</SelectItem>
                    <SelectItem value="SILVER">Silver</SelectItem>
                    <SelectItem value="GOLD">Gold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPlanChangeDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handlePlanChangeConfirm}
                disabled={
                  updatePlanMutation.isPending || newPlanType === selectedSubscription?.plan.name
                }
              >
                {updatePlanMutation.isPending ? 'Updating...' : 'Update Plan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Trial Access Dialog */}
        <Dialog open={isTrialDialogOpen} onOpenChange={setIsTrialDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-poppins font-semibold">
                {trialGrant ? 'Grant Trial Access' : 'Revoke Trial Access'}
              </DialogTitle>
              <DialogDescription className="font-inter">
                {trialGrant
                  ? `Grant 14-day trial access to ${selectedSubscription?.user.name}`
                  : `Revoke trial access from ${selectedSubscription?.user.name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="grant-trial"
                  checked={trialGrant}
                  onChange={(e) => setTrialGrant(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="grant-trial" className="font-inter font-medium">
                  Grant trial (uncheck to revoke)
                </Label>
              </div>
              <div>
                <Label htmlFor="trial-reason" className="font-inter font-medium">
                  Reason (Optional)
                </Label>
                <Textarea
                  id="trial-reason"
                  placeholder="Enter reason..."
                  value={trialReason}
                  onChange={(e) => setTrialReason(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTrialDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleTrialConfirm} disabled={trialMutation.isPending}>
                {trialMutation.isPending
                  ? 'Processing...'
                  : trialGrant
                    ? 'Grant Trial'
                    : 'Revoke Access'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageWrapper>
  );
};

export default UserSubscriptionsPage;
