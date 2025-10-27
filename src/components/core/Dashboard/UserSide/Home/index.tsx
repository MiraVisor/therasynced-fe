'use client';

import { Calendar, Heart, MessageCircle, Star } from 'lucide-react';

import { HeroSection } from '@/components/ui/hero-section';
import { useAuth } from '@/redux/hooks/useAppHooks';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import Charts from './Charts';
import Stats from './Stats';
import UpcomingSessionsList from './UpcomingSessionsList';

const UserHome = () => {
  const { role } = useAuth();

  const quickStats = [
    {
      label: 'Today&apos;s Sessions',
      value: '2',
      icon: <Calendar className="h-4 w-4 text-primary" />,
    },
    {
      label: 'Upcoming',
      value: '5',
      icon: <MessageCircle className="h-4 w-4 text-info" />,
    },
    {
      label: 'Favorites',
      value: '8',
      icon: <Heart className="h-4 w-4 text-error" />,
    },
    {
      label: 'Avg Rating',
      value: '4.9',
      icon: <Star className="h-4 w-4 text-warning" />,
    },
  ];

  return (
    <DashboardPageWrapper
      userRole={role}
      header={<h2 className="text-2xl font-poppins font-bold text-charcoal">Dashboard Overview</h2>}
    >
      <div className="flex flex-col gap-6 lg:gap-8">
        {/* Hero Section */}
        <HeroSection quickStats={quickStats} />

        {/* Stats Cards */}
        <Stats />

        {/* Charts and Upcoming Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          <div className="lg:col-span-2">
            <Charts />
          </div>
          <div className="lg:col-span-1">
            <UpcomingSessionsList />
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
};

export default UserHome;
