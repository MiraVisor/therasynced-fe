import { Calendar, Coins, Star, Users } from 'lucide-react';

import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { FreelancerDashboardOverview } from '@/types/types';

interface StatsProps {
  dashboardData: FreelancerDashboardOverview | null;
  isLoading?: boolean;
}

const Stats = ({ dashboardData, isLoading = false }: StatsProps) => {
  // Format revenue (assuming backend returns in cents, divide by 100)
  const formatRevenue = (revenueInCents: number): string => {
    return `€${(revenueInCents / 100).toLocaleString('en-US', {
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
      value: '€0',
      trend: { value: 0, isUp: true, label: 'from last week' },
      sparklineData: [0, 0, 0, 0, 0, 0, 0],
    },
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="p-6 bg-card border border-gray-200/80 rounded-xl shadow-soft space-y-4 overflow-hidden relative"
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700/30 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700/20 rounded w-2/3" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
          icon: Calendar,
          iconBg: 'bg-info/10',
          iconColor: 'text-info',
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
          icon: Star,
          iconBg: 'bg-warning/10',
          iconColor: 'text-warning',
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
          icon: Users,
          iconBg: 'bg-success/10',
          iconColor: 'text-success',
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
          icon: Coins,
          iconBg: 'bg-primary/10',
          iconColor: 'text-primary',
          sparklineData: dashboardData.weeklyRevenue.sparklineData.map((val) => val / 100),
        },
      ]
    : [
        {
          title: 'Total Appointments',
          value: defaultData.totalAppointments.value,
          trend: defaultData.totalAppointments.trend,
          icon: Calendar,
          iconBg: 'bg-info/10',
          iconColor: 'text-info',
          sparklineData: defaultData.totalAppointments.sparklineData,
        },
        {
          title: 'Client Rating',
          value: defaultData.clientRating.value,
          trend: defaultData.clientRating.trend,
          icon: Star,
          iconBg: 'bg-warning/10',
          iconColor: 'text-warning',
          sparklineData: defaultData.clientRating.sparklineData,
        },
        {
          title: 'New Clients',
          value: defaultData.newClients.value,
          trend: defaultData.newClients.trend,
          icon: Users,
          iconBg: 'bg-success/10',
          iconColor: 'text-success',
          sparklineData: defaultData.newClients.sparklineData,
        },
        {
          title: 'Weekly Revenue',
          value: defaultData.weeklyRevenue.value,
          trend: defaultData.weeklyRevenue.trend,
          icon: Coins,
          iconBg: 'bg-primary/10',
          iconColor: 'text-primary',
          sparklineData: defaultData.weeklyRevenue.sparklineData,
        },
      ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {cardsData.map((data, index) => {
        const Icon = data.icon;
        return (
          <EnhancedStatCard
            key={index}
            title={data.title}
            value={data.value}
            trend={data.trend}
            icon={Icon}
            iconColor={data.iconColor}
            iconBg={data.iconBg}
            sparklineData={data.sparklineData}
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
