'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { PlansOverview } from '@/components/core/Dashboard/Finance/PlansOverview';
import { RevenueMetrics } from '@/components/core/Dashboard/Finance/RevenueMetrics';
import { StatsCards } from '@/components/core/Dashboard/Finance/StatsCards';
import { SubscriptionAnalytics } from '@/components/core/Dashboard/Finance/SubscriptionAnalytics';
import { ChartsSkeleton } from '@/components/ui/skeletons/ChartsSkeleton';
import { useAdminRevenue, useAdminSubscriptions } from '@/hooks/queries/useAdmin';

// Dynamically import heavy chart component
const RevenueCharts = dynamic(
  () =>
    import('@/components/core/Dashboard/Finance/RevenueCharts').then((mod) => ({
      default: mod.RevenueCharts,
    })),
  {
    loading: () => <ChartsSkeleton />,
    ssr: false,
  },
);

export default function FinancePage() {
  const {
    data: revenueData,
    isLoading: isLoadingRevenue,
    isFetching: isFetchingRevenue,
    error: revenueError,
  } = useAdminRevenue();
  const {
    data: subscriptionData,
    isLoading: isLoadingSubscriptions,
    isFetching: isFetchingSubscriptions,
    error: subscriptionsError,
  } = useAdminSubscriptions();

  const isLoading = isLoadingRevenue || isLoadingSubscriptions;
  const isFetching = isFetchingRevenue || isFetchingSubscriptions;
  const initialLoading = isLoading && !revenueData && !subscriptionData;

  useEffect(() => {
    if (revenueError || subscriptionsError) {
      const errorMessage =
        revenueError instanceof Error
          ? revenueError.message
          : subscriptionsError instanceof Error
            ? subscriptionsError.message
            : 'Failed to load finance data';
      toast.error(errorMessage);
    }
  }, [revenueError, subscriptionsError]);

  return (
    <DashboardPageWrapper
      header={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
          <div>
            <h1 className="font-poppins font-bold text-2xl text-charcoal">Finance Overview</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track revenue, subscriptions, and financial metrics
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Section - 50/50 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatsCards revenueData={revenueData || null} isLoading={initialLoading} />
          <RevenueMetrics subscriptionData={subscriptionData || null} isLoading={initialLoading} />
        </div>

        {/* Subscription Overview - Combined Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SubscriptionAnalytics
            subscriptionData={subscriptionData || null}
            isLoading={isFetching}
          />
        </div>

        {/* Plans Overview */}
        <PlansOverview subscriptionData={subscriptionData || null} isLoading={isFetching} />

        {/* Charts Section */}
        <RevenueCharts
          revenueData={revenueData || null}
          subscriptionData={subscriptionData || null}
          isLoading={isFetching}
        />
      </div>
    </DashboardPageWrapper>
  );
}
