'use client';

import { useEffect } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import BookingPerformanceChart from '@/components/core/Dashboard/FreelancerSide/Analytics/BookingPerformanceChart';
import CategoryBreakdownChart from '@/components/core/Dashboard/FreelancerSide/Analytics/CategoryBreakdownChart';
import ClientEngagementChart from '@/components/core/Dashboard/FreelancerSide/Analytics/ClientEngagementChart';
import PeakTimesChart from '@/components/core/Dashboard/FreelancerSide/Analytics/PeakTimesChart';
import RatingDistributionChart from '@/components/core/Dashboard/FreelancerSide/Analytics/RatingDistributionChart';
import RevenueTrendChart from '@/components/core/Dashboard/FreelancerSide/Analytics/RevenueTrendChart';
import { UpgradeOverlay } from '@/components/core/Dashboard/FreelancerSide/Analytics/UpgradeOverlay';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import {
  useFreelancerAnalyticsOverview,
  useFreelancerBookingAnalytics,
  useFreelancerClientAnalytics,
  useFreelancerRatingAnalytics,
  useFreelancerRevenueAnalytics,
  useFreelancerServiceAnalytics,
} from '@/hooks/queries/useFreelancers';
import { useMySubscription } from '@/hooks/queries/useSubscription';
import { useAuthStore } from '@/stores/authStore';
import { isInTrial } from '@/utils/subscriptionHelpers';

const AnalyticsPage = () => {
  const { role } = useAuthStore();
  const { data: subscription, isLoading: isLoadingSubscription } = useMySubscription();

  // Three-way access level for analytics:
  //   'none'  - Bronze (no analytics)
  //   'basic' - Silver (revenue/bookings/clients/overview charts)
  //   'full'  - Gold + trial (everything, including advanced charts)
  const planName = subscription?.plan?.name;
  const hasActiveTrial = isInTrial(subscription ?? null);
  const accessLevel: 'none' | 'basic' | 'full' = hasActiveTrial
    ? 'full'
    : planName === 'GOLD'
      ? 'full'
      : planName === 'SILVER'
        ? 'basic'
        : 'none';
  const hasAccess = accessLevel !== 'none';
  const hasFullAccess = accessLevel === 'full';
  const isCheckingTier = isLoadingSubscription;

  // Fetch all analytics data using separate endpoints - only if user has Silver/Gold tier
  const {
    data: overviewData,
    isLoading: isLoadingOverview,
    error: overviewError,
  } = useFreelancerAnalyticsOverview(undefined, { enabled: hasAccess && !isLoadingSubscription });

  const {
    data: revenueData,
    isLoading: isLoadingRevenue,
    error: revenueError,
  } = useFreelancerRevenueAnalytics(
    { timeframe: 'monthly' },
    { enabled: hasAccess && !isLoadingSubscription },
  );

  const {
    data: clientData,
    isLoading: isLoadingClients,
    error: clientError,
  } = useFreelancerClientAnalytics(undefined, { enabled: hasAccess && !isLoadingSubscription });

  const {
    data: bookingData,
    isLoading: isLoadingBookings,
    error: bookingError,
  } = useFreelancerBookingAnalytics(undefined, { enabled: hasAccess && !isLoadingSubscription });

  // Advanced analytics (services, ratings) - only Gold + trial can fetch;
  // Silver calls would 403 from the backend split.
  const { data: serviceData, isLoading: isLoadingServices } = useFreelancerServiceAnalytics(
    undefined,
    { enabled: hasFullAccess && !isLoadingSubscription },
  );

  const { data: ratingData, isLoading: isLoadingRatings } = useFreelancerRatingAnalytics({
    enabled: hasFullAccess && !isLoadingSubscription,
  });

  // Show error toasts - only if user has access (to avoid showing errors for tier restrictions)
  useEffect(() => {
    if (!hasAccess) return; // Don't show errors if user doesn't have access

    if (overviewError && !overviewData) {
      toast.error('Failed to load analytics overview');
    }
    if (revenueError && !revenueData) {
      toast.error('Failed to load revenue analytics');
    }
    if (clientError && !clientData) {
      toast.error('Failed to load client analytics');
    }
    if (bookingError && !bookingData) {
      toast.error('Failed to load booking analytics');
    }
  }, [
    hasAccess,
    overviewError,
    revenueError,
    clientError,
    bookingError,
    overviewData,
    revenueData,
    clientData,
    bookingData,
  ]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `EUR ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Transform booking data for BookingPerformanceChart
  const bookingPerformanceData = bookingData
    ? {
        cancellationRate: bookingData.cancellationRate || 0,
        noShowRate: bookingData.noShowRate || 0,
        reschedulingCount: bookingData.rescheduledBookings || 0,
        conversionRate: bookingData.conversionRate || 0,
        totalBookings: bookingData.totalBookings || 0,
        cancelledBookings: bookingData.cancelledBookings || 0,
        noShowBookings: bookingData.noShowBookings || 0,
        rescheduledBookings: bookingData.rescheduledBookings || 0,
        totalSlots: bookingData.totalBookings + (bookingData.cancelledBookings || 0),
        bookedSlots: bookingData.completedBookings || 0,
      }
    : undefined;

  // Transform client data for ClientEngagementChart
  const clientEngagementData = clientData
    ? {
        retentionRate: clientData.retentionRate || 0,
        repeatClientPercentage: clientData.repeatClientPercentage || 0,
        newClients: clientData.newClients || 0,
        returningClients: clientData.returningClients || 0,
        averageSessionsPerClient: clientData.averageSessionsPerClient || 0,
        clientLifetimeValue: clientData.clientLifetimeValue || 0,
        totalClients: clientData.activeClients || 0,
      }
    : undefined;

  // Transform peak times data
  const peakTimesData = bookingData?.peakBookingTimes
    ? {
        hourlyData: bookingData.peakBookingTimes.byHour?.map(
          (item: { hour: number; bookings: number }) => ({
            hour: item.hour,
            bookings: item.bookings,
          }),
        ),
        dailyData: bookingData.peakBookingTimes.byDayOfWeek?.map(
          (item: { day: string; bookings: number }) => ({
            day: item.day,
            bookings: item.bookings,
          }),
        ),
      }
    : undefined;

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
      <div className="space-y-8 relative">
        {/* Trial notice - visible when trial grants access but user has no Gold plan */}
        {!isCheckingTier && hasActiveTrial && planName !== 'GOLD' && (
          <Alert className="border-amber-300 bg-amber-50
            <AlertDescription className="text-sm text-amber-800 font-inter">
              Analytics is included during your free trial so you can explore everything. After your
              trial ends, basic charts require <strong>Silver</strong> and advanced charts (peak
              times, rating distribution, service breakdown) require <strong>Gold</strong>.{' '}
              <a
                href="/dashboard/account?tab=subscription&view=plans"
                className="font-semibold underline hover:no-underline"
              >
                Compare plans
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Silver-tier notice - basic access but advanced charts locked */}
        {!isCheckingTier && !hasActiveTrial && planName === 'SILVER' && (
          <Alert className="border-blue-300 bg-blue-50
            <AlertDescription className="text-sm text-blue-800 font-inter">
              You're on the Silver plan - basic analytics unlocked. Advanced charts (peak times,
              rating distribution, service breakdown) are available on the{' '}
              <strong>Gold plan</strong>.{' '}
              <a
                href="/dashboard/account?tab=subscription&view=plans"
                className="font-semibold underline hover:no-underline"
              >
                Upgrade to Gold
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Upgrade Overlay for Bronze (no analytics access at all) */}
        {!isCheckingTier && !hasAccess && (
          <UpgradeOverlay
            isBlocked={true}
            requiredTier="SILVER"
            featureName="Analytics & Insights"
          />
        )}

        {/* Blur effect for users without any analytics access */}
        <div
          className={!isCheckingTier && !hasAccess ? 'pointer-events-none opacity-50 blur-sm' : ''}
        >
          {/* Stats Cards - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <EnhancedStatCard
              title="Completed Sessions"
              value={(overviewData?.completedSessions || 0).toString()}
              trend={
                overviewData?.sessionsChange !== undefined && overviewData.sessionsChange !== 0
                  ? {
                      value: Math.abs(overviewData.sessionsChange),
                      isUp: overviewData.sessionsChange > 0,
                      label:
                        overviewData.sessionsChange > 0
                          ? 'Up from last period'
                          : 'Down from last period',
                    }
                  : undefined
              }
              loading={isLoadingOverview && !overviewData}
            />
            <EnhancedStatCard
              title="Total Hours"
              value={`${(overviewData?.totalHours || 0).toFixed(1)}h`}
              loading={isLoadingOverview && !overviewData}
            />
            <EnhancedStatCard
              title="Average Rating"
              value={
                ratingData?.averageRating
                  ? ratingData.averageRating.toFixed(1)
                  : ratingData?.totalRatings === 0
                    ? 'N/A'
                    : 'N/A'
              }
              loading={isLoadingRatings && !ratingData}
            />
            <EnhancedStatCard
              title="Active Clients"
              value={(overviewData?.activeClients || 0).toString()}
              loading={isLoadingOverview && !overviewData}
            />
          </div>

          {/* Revenue & Service Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Analytics Card */}
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
                {isLoadingRevenue && !revenueData ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ) : revenueData ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-inter text-muted-foreground">
                        Total Revenue
                      </span>
                      <span className="text-xl font-poppins font-bold text-charcoal">
                        {formatCurrency(revenueData.revenueAnalytics?.totalRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-inter text-muted-foreground">
                        Average Session Price
                      </span>
                      <span className="text-lg font-poppins font-semibold text-charcoal">
                        {formatCurrency(revenueData.revenueAnalytics?.averageSessionPrice || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-inter text-muted-foreground">Change</span>
                      <span
                        className={`text-sm font-medium ${
                          (revenueData.revenueAnalytics?.revenueChange || 0) > 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        {(revenueData.revenueAnalytics?.revenueChange || 0) > 0 ? '+' : ''}
                        {(revenueData.revenueAnalytics?.revenueChange || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No revenue data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Category Analytics - Gold-only advanced chart */}
            <div className="relative">
              <CategoryBreakdownChart
                data={serviceData?.serviceCategoryAnalytics || []}
                isLoading={isLoadingServices && !serviceData}
              />
              {!hasFullAccess && (
                <div className="absolute inset-0 backdrop-blur-[2px] bg-white/40 rounded-lg flex items-center justify-center p-6">
                  <div className="bg-white rounded-lg border border-amber-300 px-4 py-3 max-w-xs text-center shadow-lg">
                    <p className="text-xs text-gray-600 font-inter">
                      <strong>Service breakdown</strong> is a Gold-only advanced chart.{' '}
                      <a
                        href="/dashboard/account?tab=subscription&view=plans"
                        className="text-primary underline font-medium"
                      >
                        Upgrade
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Performance Section */}
          <div className="space-y-4 mb-8">
            <div className="mb-4">
              <h3 className="text-xl font-poppins font-bold text-charcoal mb-2">
                Booking Performance
              </h3>
              <p className="text-sm font-inter text-muted-foreground">
                Track cancellation rates, no-shows, and booking conversion
              </p>
            </div>
            <BookingPerformanceChart
              data={bookingPerformanceData}
              isLoading={isLoadingBookings && !bookingData}
            />
          </div>

          {/* Client Engagement Section */}
          <div className="space-y-4 mb-8">
            <div className="mb-4">
              <h3 className="text-xl font-poppins font-bold text-charcoal mb-2">
                Client Engagement
              </h3>
              <p className="text-sm font-inter text-muted-foreground">
                Monitor client retention, repeat bookings, and lifetime value
              </p>
            </div>
            <ClientEngagementChart
              data={clientEngagementData}
              isLoading={isLoadingClients && !clientData}
            />
          </div>

          {/* Revenue Trends & Rating Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {revenueData?.revenueTrends && revenueData.revenueTrends.length > 0 ? (
              <RevenueTrendChart
                data={revenueData.revenueTrends.map((item: { date: string; revenue: number }) => ({
                  date: item.date,
                  revenue: item.revenue,
                }))}
                isLoading={isLoadingRevenue && !revenueData}
              />
            ) : (
              <Card className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
                <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
                  <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
                    Revenue Trends
                  </CardTitle>
                  <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
                    Revenue over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center min-h-[300px] p-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No revenue trend data available</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Revenue trends will appear here once you have booking data
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="relative">
              <RatingDistributionChart
                data={ratingData?.ratingDistribution}
                isLoading={isLoadingRatings && !ratingData}
              />
              {!hasFullAccess && (
                <div className="absolute inset-0 backdrop-blur-[2px] bg-white/40 rounded-lg flex items-center justify-center p-6">
                  <div className="bg-white rounded-lg border border-amber-300 px-4 py-3 max-w-xs text-center shadow-lg">
                    <p className="text-xs text-gray-600 font-inter">
                      <strong>Rating distribution</strong> is a Gold-only advanced chart.{' '}
                      <a
                        href="/dashboard/account?tab=subscription&view=plans"
                        className="text-primary underline font-medium"
                      >
                        Upgrade
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Peak Times Section */}
          {peakTimesData && (peakTimesData.hourlyData || peakTimesData.dailyData) && (
            <div className="space-y-4 mb-8">
              <div className="mb-4">
                <h3 className="text-xl font-poppins font-bold text-charcoal mb-2">
                  Peak Booking Times
                </h3>
                <p className="text-sm font-inter text-muted-foreground">
                  Identify your busiest times to optimise scheduling
                </p>
              </div>
              <div className="relative">
                <PeakTimesChart
                  data={peakTimesData}
                  isLoading={isLoadingBookings && !bookingData}
                />
                {!hasFullAccess && (
                  <div className="absolute inset-0 backdrop-blur-[2px] bg-white/40 rounded-lg flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg border border-amber-300 px-4 py-3 max-w-xs text-center shadow-lg">
                      <p className="text-xs text-gray-600 font-inter">
                        <strong>Peak times</strong> is a Gold-only advanced chart.{' '}
                        <a
                          href="/dashboard/account?tab=subscription&view=plans"
                          className="text-primary underline font-medium"
                        >
                          Upgrade
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Top Clients Section */}
          <Card className="border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl mt-8">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
              <CardTitle className="font-poppins text-charcoal">Top Clients</CardTitle>
              <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
                Your top clients by sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingClients && !clientData ? (
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
                          <div className="h-4 bg-gray-200 rounded w-8 mb-1" />
                          <div className="h-3 bg-gray-200 rounded w-12" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : clientData?.topClients && clientData.topClients.length > 0 ? (
                <div className="space-y-4">
                  {clientData.topClients.slice(0, 10).map((client: any) => {
                    const name = String(client.name || 'Unknown');
                    const sessions = Number(client.sessions || 0);
                    const averageRating = client.averageRating as number | null | undefined;
                    const totalHours = Number(client.totalHours || 0);
                    const totalRevenue = client.totalRevenue as number | undefined;

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
                          {averageRating !== undefined && averageRating !== null && (
                            <p className="text-sm font-medium mb-1">
                              ⭐ {averageRating.toFixed(1)}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">{totalHours.toFixed(1)}h</p>
                          {totalRevenue !== undefined && (
                            <p className="text-xs text-primary font-medium mt-1">
                              {formatCurrency(totalRevenue)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-charcoal mb-1">No clients yet</p>
                  <p className="text-xs text-muted-foreground">
                    Client data will appear here once you start receiving bookings
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPageWrapper>
  );
};

export default AnalyticsPage;
