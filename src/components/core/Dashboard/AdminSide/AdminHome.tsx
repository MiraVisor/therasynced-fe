'use client';

import { Calendar, DollarSign, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';

import { EnhancedStatCard } from '@/components/ui/enhanced-stat-card';
import { useAuth } from '@/redux/hooks/useAppHooks';

import { DashboardPageWrapper } from '../DashboardPageWrapper';
import { SearchBar } from '../SearchBar';
import {
  mockApplicationsData,
  mockAppointmentsData,
  mockChartData,
  mockStatsData,
} from '../mockData';
import { ApplicationCard } from './Cards/ApplicationCard';
import { AppointmentCard } from './Cards/AppointmentCard';
import { CardContainer } from './Cards/CardContainer';
import { AdminRevenueChart } from './Charts/AdminRevenueChart';

type IconName = 'users' | 'clients' | 'calendar' | 'money';

const AdminHome = () => {
  const { role } = useAuth();

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

  // Generate sparkline data for each stat
  const generateSparklineData = (baseValue: number) => {
    return Array.from({ length: 7 }, (_, i) => baseValue + (Math.random() - 0.5) * 20);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReviewApplication = (_id: number) => {
    // Handle application review - would typically connect to an API
  };

  const [selectedMonth, setSelectedMonth] = useState<typeof mockChartData.defaultMonth>(
    mockChartData.defaultMonth,
  );
  const chart = mockChartData.data[selectedMonth as keyof typeof mockChartData.data];

  return (
    <DashboardPageWrapper
      userRole={role}
      header={
        <div className="flex w-full items-center gap-4">
          <div className="flex-shrink-0">
            <h1 className="font-poppins font-bold text-2xl text-charcoal">Dashboard Overview</h1>
          </div>
          <div className="flex-grow flex justify-end max-w-md">
            <SearchBar placeholder={'Search'} />
          </div>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockStatsData.map((stat, index) => {
            const Icon = iconMap[stat.iconName as IconName];
            const colors = iconColors[stat.iconName as IconName];
            const numericValue = parseInt(stat.value.replace(/[^0-9]/g, '')) || 1000;

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
                sparklineData={generateSparklineData(numericValue)}
                interactive
                onClick={() => {
                  // Navigate to details or show modal
                }}
              />
            );
          })}
        </div>

        {/* Applications and Appointments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <CardContainer title="New Therapist Applications">
            {mockApplicationsData.map((application) => (
              <ApplicationCard
                key={application.id}
                name={application.name}
                specialty={application.specialty}
                onReview={() => handleReviewApplication(application.id)}
              />
            ))}
          </CardContainer>

          <CardContainer title="Today's Appointments">
            {mockAppointmentsData.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                name={appointment.name}
                time={appointment.time}
                condition={appointment.condition}
                status={appointment.status}
              />
            ))}
          </CardContainer>
        </div>

        {/* Revenue Chart */}
        <AdminRevenueChart
          month={selectedMonth}
          months={mockChartData.months}
          onMonthChange={setSelectedMonth}
          xLabels={chart.xLabels}
          profitData={chart.profitData}
          lossData={chart.lossData}
        />
      </div>
    </DashboardPageWrapper>
  );
};

export default AdminHome;
