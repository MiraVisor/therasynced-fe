'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { DateRangeFilter } from '@/components/core/Dashboard/Finance/DateRangeFilter';
import { PlansOverview } from '@/components/core/Dashboard/Finance/PlansOverview';
import { RevenueMetrics } from '@/components/core/Dashboard/Finance/RevenueMetrics';
import { StatsCards } from '@/components/core/Dashboard/Finance/StatsCards';
import { SubscriptionAnalytics } from '@/components/core/Dashboard/Finance/SubscriptionAnalytics';
import { SubscriptionMetricsComponent } from '@/components/core/Dashboard/Finance/SubscriptionMetrics';
import { ChartsSkeleton } from '@/components/ui/skeletons/ChartsSkeleton';
import {
  useAdminRevenue,
  useAdminSubscriptions,
  useSubscriptionMetrics,
} from '@/hooks/queries/useAdmin';

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
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

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
  const {
    data: metricsData,
    isLoading: isLoadingMetrics,
    isFetching: isFetchingMetrics,
    error: metricsError,
  } = useSubscriptionMetrics(startDate, endDate);

  const isLoading = isLoadingRevenue || isLoadingSubscriptions || isLoadingMetrics;
  const isFetching = isFetchingRevenue || isFetchingSubscriptions || isFetchingMetrics;
  const initialLoading = isLoading && !revenueData && !subscriptionData && !metricsData;

  useEffect(() => {
    if (revenueError || subscriptionsError || metricsError) {
      const errorMessage =
        revenueError instanceof Error
          ? revenueError.message
          : subscriptionsError instanceof Error
            ? subscriptionsError.message
            : metricsError instanceof Error
              ? metricsError.message
              : 'Failed to load finance data';
      toast.error(errorMessage);
    }
  }, [revenueError, subscriptionsError, metricsError]);

  const handleDateRangeChange = (newStartDate: Date | undefined, newEndDate: Date | undefined) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

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

        {/* Subscription Metrics Section with Date Range Filter */}
        <div className="space-y-4">
          <DateRangeFilter
            onDateRangeChange={handleDateRangeChange}
            startDate={startDate}
            endDate={endDate}
          />
          <SubscriptionMetricsComponent
            metricsData={metricsData || null}
            isLoading={isFetchingMetrics}
          />
        </div>

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
