'use client';

import { Calendar, DollarSign, MessageSquare, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { HeroSection } from '@/components/ui/hero-section';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { getFreelancerDashboardOverview } from '@/redux/api/dashboardApi';
import { useAuth } from '@/redux/hooks/useAppHooks';
import { FreelancerDashboardOverview } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import TrialBanner from '../Subscription/TrialBanner';
import Charts from './Charts';
import Stats from './Stats';
import TodayAppointments from './TodayAppointments';

const FreelancerHome = () => {
  const { role } = useAuth();
  const [dashboardData, setDashboardData] = useState<FreelancerDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getFreelancerDashboardOverview();
        if (response.success && response.data) {
          setDashboardData(response.data);
        } else {
          toast.error('Failed to load dashboard data');
        }
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast.error(error?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  if (loading) {
    return (
      <DashboardPageWrapper
        userRole={role}
        header={
          <h2 className="text-2xl font-poppins font-bold text-charcoal">Platform Overview</h2>
        }
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper
      userRole={role}
      header={<h2 className="text-2xl font-poppins font-bold text-charcoal">Platform Overview</h2>}
    >
      <div className="flex flex-col gap-6 lg:gap-8">
        {/* Trial Banner */}
        <TrialBanner />

        {/* Hero Section */}
        <HeroSection quickStats={quickStats} />

        {/* Stats Cards */}
        <Stats dashboardData={dashboardData} />

        {/* Charts and Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          <div className="lg:col-span-2">
            <Charts dashboardData={dashboardData} />
          </div>
          <div className="lg:col-span-1">
            <TodayAppointments />
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
};

export default FreelancerHome;
