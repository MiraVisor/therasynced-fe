'use client';

import { Calendar, DollarSign, MessageSquare, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

import { HeroSection } from '@/components/ui/hero-section';
import { useAuth, useFreelancerDashboard } from '@/redux/hooks/useAppHooks';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import TrialBanner from '../Subscription/TrialBanner';
import Charts from './Charts';
import Stats from './Stats';
import TodayAppointments from './TodayAppointments';

const FreelancerHome = () => {
  const { role } = useAuth();
  const { data: dashboardData, loading, error, fetchDashboard } = useFreelancerDashboard();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // If data exists, fetch silently in background
        // If no data exists, show loading state
        await fetchDashboard({ silent: !!dashboardData });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
        toast.error(`Error loading dashboard data: ${errorMessage}`);
      }
    };

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show error toast only on error (not during silent refresh)
  useEffect(() => {
    if (error && !dashboardData) {
      toast.error(error);
    }
  }, [error, dashboardData]);

  // Format revenue (assuming backend returns in cents, divide by 100)
  const formatRevenue = (revenueInCents: number): string => {
    return `€${(revenueInCents / 100).toLocaleString('en-US', {
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
          icon: <Calendar className="h-4 w-4 text-primary" />,
        },
        {
          label: 'Revenue',
          value: formatRevenue(dashboardData.todayRevenue),
          icon: <DollarSign className="h-4 w-4 text-success" />,
        },
        {
          label: 'Messages',
          value: dashboardData.unreadMessages.toString(),
          icon: <MessageSquare className="h-4 w-4 text-info" />,
        },
        {
          label: 'Growth',
          value: formatGrowth(dashboardData.growthPercentage),
          icon: <TrendingUp className="h-4 w-4 text-warning" />,
        },
      ]
    : [
        {
          label: "Today's Bookings",
          value: '0',
          icon: <Calendar className="h-4 w-4 text-primary" />,
        },
        { label: 'Revenue', value: '€0', icon: <DollarSign className="h-4 w-4 text-success" /> },
        { label: 'Messages', value: '0', icon: <MessageSquare className="h-4 w-4 text-info" /> },
        { label: 'Growth', value: '+0%', icon: <TrendingUp className="h-4 w-4 text-warning" /> },
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

        {/* Charts and Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          <div className="lg:col-span-2">
            <Charts dashboardData={dashboardData} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-1">
            <TodayAppointments isLoading={isLoading} />
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
};

export default FreelancerHome;
