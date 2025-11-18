'use client';

import { CheckCircle, Clock, Star, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import CategoryBreakdownChart from '@/components/core/Dashboard/FreelancerSide/Analytics/CategoryBreakdownChart';
import RevenueTrendChart from '@/components/core/Dashboard/FreelancerSide/Analytics/RevenueTrendChart';
import ServiceAnalyticsChart from '@/components/core/Dashboard/FreelancerSide/Analytics/ServiceAnalyticsChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/redux/hooks/useAppHooks';
import { fetchFreelancerAnalytics } from '@/redux/slices/analyticsSlice';
import { RootState } from '@/redux/store';

const AnalyticsPage = () => {
  const { role } = useAuth();
  const dispatch = useDispatch();
  const {
    data: analyticsData,
    loading,
    initialLoading,
    error,
  } = useSelector((state: RootState) => state.analytics);

  // Fetch analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // If data exists, fetch silently in background
        // If no data exists, show loading state
        await dispatch(fetchFreelancerAnalytics({ silent: !!analyticsData }) as any);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
        if (!analyticsData) {
          toast.error(`Failed to load analytics: ${errorMessage}`);
        }
      }
    };

    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Show error toast only on error (not during silent refresh)
  useEffect(() => {
    if (error && !analyticsData) {
      toast.error(error);
    }
  }, [error, analyticsData]);

  // Only show loader if no data exists (preserve state during refresh)
  const isLoading = initialLoading || (loading && !analyticsData);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `€${amount.toLocaleString('en-US', {
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
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={index}
                className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl"
              >
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                      <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Completed Sessions */}
            <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter font-medium text-success">
                      Completed Sessions
                    </p>
                    <p className="text-2xl font-poppins font-bold text-charcoal">
                      {analyticsData?.completedSessions || 0}
                    </p>
                    <div className="flex items-center mt-1">
                      {analyticsData && analyticsData.sessionsChange > 0 ? (
                        <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span
                        className={`text-xs ${
                          analyticsData && analyticsData.sessionsChange > 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        {analyticsData
                          ? `${Math.abs(analyticsData.sessionsChange).toFixed(1)}% from last period`
                          : '0%'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Hours */}
            <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter font-medium text-info">Total Hours</p>
                    <p className="text-2xl font-poppins font-bold text-charcoal">
                      {analyticsData?.totalHours.toFixed(1) || '0.0'}h
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {analyticsData?.completionRate.toFixed(1) || '0.0'}% completion rate
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-50 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average Rating */}
            <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter font-medium text-warning">Average Rating</p>
                    <p className="text-2xl font-poppins font-bold text-charcoal">
                      {analyticsData?.averageRating
                        ? analyticsData.averageRating.toFixed(1)
                        : 'N/A'}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-purple-600 mr-1" />
                      <span className="text-xs text-purple-600">
                        {analyticsData?.ratedSessions || 0} rated sessions
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-50 group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Clients */}
            <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter font-medium text-primary">Active Clients</p>
                    <p className="text-2xl font-poppins font-bold text-charcoal">
                      {analyticsData?.activeClients || 0}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      {analyticsData?.newClients || 0} new, {analyticsData?.returningClients || 0}{' '}
                      returning
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Middle Section - 2 Columns */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="min-h-[300px] bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="min-h-[300px] bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="min-h-[300px] bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="min-h-[300px] bg-gray-100 rounded"></div>
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
                          : '€0'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-inter text-muted-foreground">
                        Average Session Price
                      </span>
                      <span className="text-lg font-poppins font-semibold text-charcoal">
                        {analyticsData
                          ? formatCurrency(analyticsData.revenueAnalytics.averageSessionPrice)
                          : '€0'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-inter text-muted-foreground">Change</span>
                      <div className="flex items-center gap-1">
                        {analyticsData && analyticsData.revenueAnalytics.revenueChange > 0 ? (
                          <TrendingUp className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            analyticsData && analyticsData.revenueAnalytics.revenueChange > 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}
                        >
                          {analyticsData
                            ? `${Math.abs(analyticsData.revenueAnalytics.revenueChange).toFixed(1)}%`
                            : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <RevenueTrendChart
                data={analyticsData?.revenueAnalytics?.timeSeries?.map((item) => ({
                  date: new Date(item.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  }),
                  revenue: item.revenue,
                }))}
                isLoading={false}
              />
            </div>

            {/* Right Column: Service Analytics */}
            <div className="space-y-6">
              <ServiceAnalyticsChart
                data={analyticsData?.serviceAnalytics || []}
                isLoading={false}
              />
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
            <CardTitle className="flex items-center gap-2 font-poppins text-charcoal">
              <Users className="h-5 w-5" />
              Top Clients
            </CardTitle>
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
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-3 h-3 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-8"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : analyticsData && analyticsData.topClients.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.topClients.slice(0, 5).map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-emerald-600">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-poppins font-medium text-charcoal">{client.name}</p>
                        <p className="text-xs font-inter text-muted-foreground">
                          {client.sessions} {client.sessions === 1 ? 'session' : 'sessions'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {client.averageRating !== undefined ? (
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-medium">
                            {client.averageRating.toFixed(1)}
                          </span>
                        </div>
                      ) : null}
                      <p className="text-xs text-gray-500">{client.totalHours.toFixed(1)}h</p>
                    </div>
                  </div>
                ))}
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
