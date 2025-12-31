'use client';

import { useEffect } from 'react';
import { toast } from 'react-toastify';

import { HeroSection } from '@/components/ui/hero-section';
import { useFreelancerDashboard } from '@/hooks/queries/useFreelancers';
import { useAuth } from '@/hooks/useAuthZustand';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import TrialBanner from '../Subscription/TrialBanner';
import Charts from './Charts';
import Stats from './Stats';

const FreelancerHome = () => {
  const { role } = useAuth();
  const { data: dashboardData, isLoading: loading, error } = useFreelancerDashboard();

  // Show error toast only on error
  useEffect(() => {
    if (error && !dashboardData) {
      toast.error((error as any)?.message || 'Failed to load dashboard data');
    }
  }, [error, dashboardData]);

  // Format revenue (assuming backend returns in cents, divide by 100)
  const formatRevenue = (revenueInCents: number): string => {
    return `EUR ${(revenueInCents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Format growth percentage
  const formatGrowth = (percentage: number): string => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  // Only show loading skeleton if we don't have cached data
  const isLoading = loading && !dashboardData;

  const quickStats = dashboardData
    ? [
        {
          label: "Today's Bookings",
          value: dashboardData.todayBookings.toString(),
        },
        {
          label: 'Revenue',
          value: formatRevenue(dashboardData.todayRevenue),
        },
        {
          label: 'Messages',
          value: dashboardData.unreadMessages.toString(),
        },
        {
          label: 'Growth',
          value: formatGrowth(dashboardData.growthPercentage),
        },
      ]
    : [
        {
          label: "Today's Bookings",
          value: '0',
        },
        { label: 'Revenue', value: 'EUR 0' },
        { label: 'Messages', value: '0' },
        { label: 'Growth', value: '+0%' },
      ];

  return (
    <DashboardPageWrapper
      userRole={role}
      header={<h2 className="text-2xl font-poppins font-bold text-charcoal">Platform Overview</h2>}
    >
      <div className="flex flex-col gap-6 lg:gap-8">
        {/* Trial Banner */}
        <TrialBanner />

        {/* Hero Section */}
        <HeroSection quickStats={quickStats} isLoading={isLoading} />

        {/* Stats Cards */}
        <Stats dashboardData={dashboardData} isLoading={isLoading} />

        {/* Weekly Appointments Chart - Full Width */}
        <Charts dashboardData={dashboardData} isLoading={isLoading} />
      </div>
    </DashboardPageWrapper>
  );
};

export default FreelancerHome;
