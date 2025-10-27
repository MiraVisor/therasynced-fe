'use client';

import { Calendar, DollarSign, MessageSquare, TrendingUp } from 'lucide-react';

import { HeroSection } from '@/components/ui/hero-section';
import { useAuth } from '@/redux/hooks/useAppHooks';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import TrialBanner from '../Subscription/TrialBanner';
import Charts from './Charts';
import Stats from './Stats';
import TodayAppointments from './TodayAppointments';

const FreelancerHome = () => {
  const { role } = useAuth();

  const quickStats = [
    { label: "Today's Bookings", value: '5', icon: <Calendar className="h-4 w-4 text-primary" /> },
    { label: 'Revenue', value: '€420', icon: <DollarSign className="h-4 w-4 text-success" /> },
    { label: 'Messages', value: '3', icon: <MessageSquare className="h-4 w-4 text-info" /> },
    { label: 'Growth', value: '+18%', icon: <TrendingUp className="h-4 w-4 text-warning" /> },
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
        <HeroSection quickStats={quickStats} />

        {/* Stats Cards */}
        <Stats />

        {/* Charts and Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          <div className="lg:col-span-2">
            <Charts />
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
