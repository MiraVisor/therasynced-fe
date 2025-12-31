'use client';

import { useEffect } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import CategoryBreakdownChart from '@/components/core/Dashboard/FreelancerSide/Analytics/CategoryBreakdownChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { useFreelancerAnalytics } from '@/hooks/queries/useFreelancers';
import { useAuthStore } from '@/stores/authStore';

const AnalyticsPage = () => {
  const { role } = useAuthStore();

  const { data: analyticsData, isLoading, error } = useFreelancerAnalytics();

  // Show error toast only when no cached data exists
  useEffect(() => {
    if (error && !analyticsData) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load analytics data';
      toast.error(errorMessage);
    }
  }, [error, analyticsData]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `EUR ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <DashboardPageWrapper
      userRole={role}
      header={
        <div className="flex flex-col gap-2 w-full">
          <h2 className="text-2xl font-poppins font-bold text-charcoal">Analytics & Insights</h2>
          <p className="font-inter text-muted-foreground">
            Track your performance and client engagement
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedStatCard
            title="Completed Sessions"
            value={(analyticsData?.completedSessions || 0).toString()}
            trend={
              analyticsData?.sessionsChange
                ? {
                    value: Math.abs(analyticsData.sessionsChange),
                    isUp: analyticsData.sessionsChange > 0,
                    label:
                      analyticsData.sessionsChange > 0
                        ? 'Up from last period'
                        : 'Down from last period',
                  }
                : undefined
            }
            loading={isLoading && !analyticsData}
          />
          <EnhancedStatCard
            title="Total Hours"
            value={`${analyticsData?.totalHours.toFixed(1) || '0.0'}h`}
            loading={isLoading && !analyticsData}
          />
          <EnhancedStatCard
            title="Average Rating"
            value={analyticsData?.averageRating ? analyticsData.averageRating.toFixed(1) : 'N/A'}
            loading={isLoading && !analyticsData}
          />
          <EnhancedStatCard
            title="Active Clients"
            value={(analyticsData?.activeClients || 0).toString()}
            loading={isLoading && !analyticsData}
          />
        </div>

        {/* Middle Section - 2 Columns */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                  <div className="min-h-[300px] bg-gray-100 rounded" />
                </div>
              </div>
              <div className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                  <div className="min-h-[300px] bg-gray-100 rounded" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                  <div className="min-h-[300px] bg-gray-100 rounded" />
                </div>
              </div>
              <div className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                  <div className="min-h-[300px] bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Revenue Analytics */}
            <div className="space-y-6">
              <Card className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
                <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
                  <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
                    Revenue Analytics
                  </CardTitle>
                  <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
                    Revenue overview and trends
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 min-h-[300px]">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-inter text-muted-foreground">
                        Total Revenue
                      </span>
                      <span className="text-xl font-poppins font-bold text-charcoal">
                        {analyticsData
                          ? formatCurrency(analyticsData.revenueAnalytics.totalRevenue)
                          : 'EUR 0'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-inter text-muted-foreground">
                        Average Session Price
                      </span>
                      <span className="text-lg font-poppins font-semibold text-charcoal">
                        {analyticsData
                          ? formatCurrency(analyticsData.revenueAnalytics.averageSessionPrice)
                          : 'EUR 0'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-inter text-muted-foreground">Change</span>
                      <span
                        className={`text-sm font-medium ${
                          analyticsData && analyticsData.revenueAnalytics.revenueChange > 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        {analyticsData
                          ? `${analyticsData.revenueAnalytics.revenueChange > 0 ? '+' : ''}${analyticsData.revenueAnalytics.revenueChange.toFixed(1)}%`
                          : '0%'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Service Analytics */}
            <div className="space-y-6">
              <CategoryBreakdownChart
                data={analyticsData?.serviceCategoryAnalytics || []}
                isLoading={false}
              />
            </div>
          </div>
        )}

        {/* Bottom Section: Top 5 Clients */}
        <Card className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
            <CardTitle className="font-poppins text-charcoal">Top Clients</CardTitle>
            <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
              Your top 5 clients by sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                          <div className="h-3 bg-gray-200 rounded w-16" />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-3 h-3 bg-gray-200 rounded" />
                          <div className="h-4 bg-gray-200 rounded w-8" />
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-12" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : analyticsData && analyticsData.topClients.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.topClients
                  .slice(0, 5)
                  .map((client: { id: string; [key: string]: unknown }) => {
                    const name = String(client['name'] || 'Unknown');
                    const sessions = Number(client['sessions'] || 0);
                    const averageRating = client['averageRating'] as number | null | undefined;
                    const totalHours = Number(client['totalHours'] || 0);

                    return (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-emerald-600">
                              {name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-poppins font-medium text-charcoal">{name}</p>
                            <p className="text-xs font-inter text-muted-foreground">
                              {sessions} {sessions === 1 ? 'session' : 'sessions'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {averageRating !== undefined && averageRating !== null ? (
                            <p className="text-sm font-medium mb-1">{averageRating.toFixed(1)}</p>
                          ) : null}
                          <p className="text-xs text-gray-500">{totalHours.toFixed(1)}h</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No client data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardPageWrapper>
  );
};

export default AnalyticsPage;
