'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar, DollarSign, UserCheck, Users } from 'lucide-react';
import { toast } from 'react-toastify';

import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import adminOverviewService from '@/services/adminOverviewService';
import { useAuthStore } from '@/stores/authStore';

import { DashboardPageWrapper } from '../DashboardPageWrapper';
import { AdminRevenueChart } from './Charts/AdminRevenueChart';

type IconName = 'users' | 'clients' | 'calendar' | 'money';

const AdminHome = () => {
  const { role } = useAuthStore();

  const {
    data: overviewData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['adminOverview'],
    queryFn: () => adminOverviewService.getOverview(),
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load overview data';
      toast.error(`Error loading overview data: ${errorMessage}`);
    },
  });

  const initialLoading = isLoading && !overviewData;

  // Map icons to Lucide icons for EnhancedStatCard
  const iconMap = {
    users: Users,
    clients: UserCheck,
    calendar: Calendar,
    money: DollarSign,
  };

  // Map icon names to semantic colors
  const iconColors: Record<IconName, { iconColor: string; iconBg: string }> = {
    users: { iconColor: 'text-info', iconBg: 'bg-info/10' },
    clients: { iconColor: 'text-warning', iconBg: 'bg-warning/10' },
    calendar: { iconColor: 'text-error', iconBg: 'bg-error/10' },
    money: { iconColor: 'text-primary', iconBg: 'bg-primary/10' },
  };

  // Format currency value
  const formatCurrency = (value: number): string => {
    return `EUR ${value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Format number value
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Transform chart data from API format to chart component format
  const chartData = overviewData?.monthlyRevenueChart || [];
  const xLabels =
    chartData.length > 0
      ? chartData.map((item) => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        })
      : [];
  const profitData = chartData.map((item) => item.profit || 0);
  const lossData = chartData.map((item) => item.loss || 0);

  // Prepare stats data from API
  const statsData = [
    {
      title: 'Total Users',
      value: formatNumber(overviewData?.totalUsers?.value || 0),
      trend: {
        value: Math.abs(overviewData?.totalUsers?.percentageChange || 0),
        isUp: (overviewData?.totalUsers?.percentageChange || 0) >= 0,
        timeframe: overviewData?.totalUsers?.comparisonPeriod || 'N/A',
      },
      iconName: 'users' as IconName,
    },
    {
      title: 'Active Clients',
      value: formatNumber(overviewData?.activeClients?.value || 0),
      trend: {
        value: Math.abs(overviewData?.activeClients?.percentageChange || 0),
        isUp: (overviewData?.activeClients?.percentageChange || 0) >= 0,
        timeframe: overviewData?.activeClients?.comparisonPeriod || 'N/A',
      },
      iconName: 'clients' as IconName,
    },
    {
      title: 'Sessions This Month',
      value: formatNumber(overviewData?.sessionsThisMonth?.value || 0),
      trend: {
        value: Math.abs(overviewData?.sessionsThisMonth?.percentageChange || 0),
        isUp: (overviewData?.sessionsThisMonth?.percentageChange || 0) >= 0,
        timeframe: overviewData?.sessionsThisMonth?.comparisonPeriod || 'N/A',
      },
      iconName: 'calendar' as IconName,
    },
    {
      title: 'Revenue',
      value: formatCurrency(overviewData?.revenue?.value || 0),
      trend: {
        value: Math.abs(overviewData?.revenue?.percentageChange || 0),
        isUp: (overviewData?.revenue?.percentageChange || 0) >= 0,
        timeframe: overviewData?.revenue?.comparisonPeriod || 'N/A',
      },
      iconName: 'money' as IconName,
    },
  ];

  return (
    <DashboardPageWrapper
      userRole={role}
      header={
        <div className="flex flex-col sm:flex-row w-full items-start gap-4">
          <div className="flex-shrink-0">
            <h1 className="font-poppins font-bold text-2xl text-charcoal">Dashboard Overview</h1>
          </div>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => {
            const Icon = iconMap[stat.iconName as IconName];
            const colors = iconColors[stat.iconName as IconName];

            return (
              <EnhancedStatCard
                key={index}
                title={stat.title}
                value={stat.value}
                trend={{
                  value: stat.trend.value,
                  isUp: stat.trend.isUp,
                  label: stat.trend.timeframe,
                }}
                icon={Icon}
                iconColor={colors.iconColor}
                iconBg={colors.iconBg}
                interactive
                onClick={() => {
                  // Navigate to details or show modal
                }}
              />
            );
          })}
        </div>

        {/* Revenue Chart */}
        <AdminRevenueChart
          month="Current Month"
          months={['Current Month']}
          onMonthChange={() => {}}
          xLabels={xLabels.length > 0 ? xLabels : ['1', '5', '10', '15', '20', '25', '30']}
          profitData={profitData.length > 0 ? profitData : [0, 0, 0, 0, 0, 0, 0]}
          lossData={lossData.length > 0 ? lossData : [0, 0, 0, 0, 0, 0, 0]}
          title="Monthly Revenue"
          showSelector={false}
        />
      </div>
    </DashboardPageWrapper>
  );
};

export default AdminHome;
