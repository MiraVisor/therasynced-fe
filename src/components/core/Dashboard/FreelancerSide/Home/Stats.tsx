import { RatingDisplay } from '@/components/core/Dashboard/UserSide/Ratings/RatingDisplay';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { Sparkline } from '@/components/ui/sparkline';
import { useProfile } from '@/hooks/queries/useProfile';
import { useFreelancerRatings } from '@/hooks/queries/useRatings';
import { cn } from '@/lib/utils';
import { FreelancerDashboardOverview } from '@/types/types';

interface StatsProps {
  dashboardData: FreelancerDashboardOverview | null;
  isLoading?: boolean;
}

const Stats = ({ dashboardData, isLoading = false }: StatsProps) => {
  const { data: profileData } = useProfile();
  const freelancerId = profileData?.id;
  const { data: ratingsData } = useFreelancerRatings(freelancerId ?? null, {
    page: 1,
    limit: 1, // We only need the pagination total
  });
  const totalRatings = ratingsData?.pagination?.total ?? 0;

  // Format revenue (assuming backend returns in cents, divide by 100)
  const formatRevenue = (revenueInCents: number): string => {
    return `EUR ${(revenueInCents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  // Format rating to 1 decimal place
  const formatRating = (rating: number): string => {
    return rating.toFixed(1);
  };

  // Default data if not loaded yet
  const defaultData = {
    totalAppointments: {
      value: '0',
      trend: { value: 0, isUp: true, label: 'from last month' },
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
    },
    clientRating: {
      value: '0.0',
      trend: { value: 0, isUp: true, label: 'from last month' },
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
    },
    newClients: {
      value: '0',
      trend: { value: 0, isUp: true, label: 'this month' },
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
    },
    weeklyRevenue: {
      value: 'EUR 0',
      trend: { value: 0, isUp: true, label: 'from last week' },
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
    },
  };

  // Only show loading if no cached data
  const isLoadingData = isLoading && !dashboardData;

  const cardsData = dashboardData
    ? [
        {
          title: 'Total Appointments',
          value: formatNumber(dashboardData.totalAppointments.value),
          trend: {
            value: dashboardData.totalAppointments.trendPercentage,
            isUp: dashboardData.totalAppointments.trendDirection === 'up',
            label: 'from last month',
          },
          sparklineData: dashboardData.totalAppointments.sparklineData,
        },
        {
          title: 'Client Rating',
          value: formatRating(dashboardData.clientRating.value),
          trend: {
            value: dashboardData.clientRating.trendPercentage,
            isUp: dashboardData.clientRating.trendDirection === 'up',
            label: 'from last month',
          },
          sparklineData: dashboardData.clientRating.sparklineData,
        },
        {
          title: 'New Clients',
          value: formatNumber(dashboardData.newClients.value),
          trend: {
            value: dashboardData.newClients.trendPercentage,
            isUp: dashboardData.newClients.trendDirection === 'up',
            label: 'this month',
          },
          sparklineData: dashboardData.newClients.sparklineData,
        },
        {
          title: 'Weekly Revenue',
          value: formatRevenue(dashboardData.weeklyRevenue.value),
          trend: {
            value: dashboardData.weeklyRevenue.trendPercentage,
            isUp: dashboardData.weeklyRevenue.trendDirection === 'up',
            label: 'from last week',
          },
          sparklineData: dashboardData.weeklyRevenue.sparklineData.map((val) => val / 100),
        },
      ]
    : [
        {
          title: 'Total Appointments',
          value: defaultData.totalAppointments.value,
          trend: defaultData.totalAppointments.trend,
          sparklineData: defaultData.totalAppointments.sparklineData,
        },
        {
          title: 'Client Rating',
          value: defaultData.clientRating.value,
          trend: defaultData.clientRating.trend,
          sparklineData: defaultData.clientRating.sparklineData,
        },
        {
          title: 'New Clients',
          value: defaultData.newClients.value,
          trend: defaultData.newClients.trend,
          sparklineData: defaultData.newClients.sparklineData,
        },
        {
          title: 'Weekly Revenue',
          value: defaultData.weeklyRevenue.value,
          trend: defaultData.weeklyRevenue.trend,
          sparklineData: defaultData.weeklyRevenue.sparklineData,
        },
      ];

  const ratingValue =
    dashboardData && typeof dashboardData.clientRating.value === 'number'
      ? dashboardData.clientRating.value
      : parseFloat(defaultData.clientRating.value) || 0;
  const ratingTrend = dashboardData ? dashboardData.clientRating : defaultData.clientRating;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {cardsData.map((data, index) => {
        // Render custom rating card for Client Rating
        if (data.title === 'Client Rating') {
          return (
            <EnhancedCard
              key={index}
              variant="default"
              interactive
              onClick={() => {
                // Navigate to details or show modal
              }}
              className="group"
            >
              <div className="p-6 space-y-4">
                {/* Header with title */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-inter font-medium text-muted-foreground">
                      {data.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <div className="flex items-center gap-2">
                        <RatingDisplay
                          rating={Number(ratingValue)}
                          reviewCount={totalRatings}
                          size="md"
                          showCount={true}
                        />
                      </div>
                      {('trend' in ratingTrend ? ratingTrend.trend : null) && (
                        <div
                          className={cn(
                            'text-xs font-medium',
                            'trend' in ratingTrend && ratingTrend.trend.isUp
                              ? 'text-success'
                              : 'text-error',
                          )}
                        >
                          {'trend' in ratingTrend && ratingTrend.trend.isUp ? '+' : ''}
                          {Math.abs(
                            'trend' in ratingTrend
                              ? ratingTrend.trend.value
                              : ratingTrend.trendPercentage,
                          ).toFixed(1)}
                          %
                        </div>
                      )}
                      {!('trend' in ratingTrend) && (
                        <div
                          className={cn(
                            'text-xs font-medium',
                            ratingTrend.trendDirection === 'up' ? 'text-success' : 'text-error',
                          )}
                        >
                          {ratingTrend.trendDirection === 'up' ? '+' : ''}
                          {Math.abs(ratingTrend.trendPercentage).toFixed(1)}%
                        </div>
                      )}
                    </div>
                    {'trend' in ratingTrend && ratingTrend.trend?.label && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {ratingTrend.trend.label}
                      </p>
                    )}
                    {!('trend' in ratingTrend) && (
                      <p className="text-xs text-muted-foreground mt-1">from last month</p>
                    )}
                  </div>
                </div>

                {/* Sparkline chart */}
                {ratingTrend.sparklineData && ratingTrend.sparklineData.length > 0 && (
                  <div className="pt-2">
                    <Sparkline
                      data={ratingTrend.sparklineData}
                      color="#007745"
                      width={100}
                      height={30}
                    />
                  </div>
                )}
              </div>
            </EnhancedCard>
          );
        }

        // Render regular stat cards for others
        return (
          <EnhancedStatCard
            key={index}
            title={data.title}
            value={data.value}
            trend={data.trend}
            sparklineData={data.sparklineData}
            loading={isLoadingData}
            interactive
            onClick={() => {
              // Navigate to details or show modal
            }}
          />
        );
      })}
    </div>
  );
};

export default Stats;
