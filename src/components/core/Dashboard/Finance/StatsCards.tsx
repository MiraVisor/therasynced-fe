'use client';

import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { AdminRevenueDto } from '@/services/adminFinanceService';

interface StatsCardsProps {
  revenueData: AdminRevenueDto | null;
  isLoading: boolean;
}

export function StatsCards({ revenueData, isLoading }: StatsCardsProps) {
  const formatCurrency = (value: number): string => {
    return `EUR ${value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const statsData = revenueData
    ? [
        {
          title: 'Total Revenue',
          value: formatCurrency(revenueData.totalRevenue.value),
          trend: {
            value: Math.abs(revenueData.totalRevenue.percentageChange),
            isUp: revenueData.totalRevenue.percentageChange >= 0,
            label: revenueData.totalRevenue.comparisonPeriod,
          },
        },
        {
          title: 'Active Therapists',
          value: formatNumber(revenueData.activeTherapists.value),
          trend: {
            value: Math.abs(revenueData.activeTherapists.percentageChange),
            isUp: revenueData.activeTherapists.percentageChange >= 0,
            label: revenueData.activeTherapists.comparisonPeriod,
          },
        },
        {
          title: 'Completed Sessions',
          value: formatNumber(revenueData.completedSessions.value),
          trend: {
            value: Math.abs(revenueData.completedSessions.percentageChange),
            isUp: revenueData.completedSessions.percentageChange >= 0,
            label: revenueData.completedSessions.comparisonPeriod,
          },
        },
        {
          title: 'Average session price',
          value: formatCurrency(revenueData.averageSessionPrice.value),
          trend: {
            value: Math.abs(revenueData.averageSessionPrice.percentageChange),
            isUp: revenueData.averageSessionPrice.percentageChange >= 0,
            label: revenueData.averageSessionPrice.comparisonPeriod,
          },
        },
      ]
    : [
        {
          title: 'Total Revenue',
          value: 'EUR 0',
          trend: undefined,
        },
        {
          title: 'Active Therapists',
          value: '0',
          trend: undefined,
        },
        {
          title: 'Completed Sessions',
          value: '0',
          trend: undefined,
        },
        {
          title: 'Average session price',
          value: 'EUR 0',
          trend: undefined,
        },
      ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {statsData.map((stat, index) => {
        return (
          <EnhancedStatCard
            key={index}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            interactive
            loading={isLoading}
            onClick={() => {
              // Navigate to details or show modal
            }}
          />
        );
      })}
    </div>
  );
}
