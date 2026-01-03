'use client';

import { format } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTodayBookingsFreelancer } from '@/hooks/queries/useBookings';
import { useFreelancerDashboard } from '@/hooks/queries/useFreelancers';
import { useAuth } from '@/hooks/useAuthZustand';
import { cn } from '@/lib/utils';
import { LocationType } from '@/types/enums';
import { Booking } from '@/types/types';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import TrialBanner from '../Subscription/TrialBanner';
import Charts from './Charts';
import { ProfileCompletionWidget } from './ProfileCompletionWidget';

// ============================================================================
// Helper Functions
// ============================================================================

const formatLocation = (locationType: string): string => {
  switch (locationType) {
    case LocationType.CLINIC:
      return 'Clinic';
    case LocationType.HOME:
      return 'Home Visit';
    default:
      return 'Online';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'RESCHEDULED':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// ============================================================================
// Today's Appointments Component
// ============================================================================

const TodayAppointments = () => {
  const router = useRouter();
  const { data: bookings = [], isLoading } = useTodayBookingsFreelancer();

  const todayAppointments = useMemo(() => {
    return bookings
      .filter((booking: Booking) => {
        const bookingDate = new Date(booking.slot.startTime);
        const today = new Date();
        const isToday =
          bookingDate.getDate() === today.getDate() &&
          bookingDate.getMonth() === today.getMonth() &&
          bookingDate.getFullYear() === today.getFullYear();
        return isToday && (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED');
      })
      .sort(
        (a: Booking, b: Booking) =>
          new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime(),
      );
  }, [bookings]);

  if (isLoading && bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
            Today&apos;s Appointments
          </CardTitle>
          <CardDescription className="font-inter">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse"
              >
                <div className="flex-1 min-w-0">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700/60 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
              Today&apos;s Appointments
            </CardTitle>
            <CardDescription className="font-inter">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/appointments')}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {todayAppointments.length > 0 ? (
          <div className="space-y-3">
            {todayAppointments.slice(0, 5).map((booking: Booking) => {
              const serviceName =
                booking.serviceCategories && booking.serviceCategories.length > 0
                  ? booking.serviceCategories.map((sc) => sc.name).join(', ')
                  : 'Session';

              return (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => router.push('/dashboard/appointments')}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-poppins font-semibold text-gray-900 dark:text-white truncate">
                        {booking.client.name}
                      </h4>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status === 'CONFIRMED' ? 'Upcoming' : booking.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-inter text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(booking.slot.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{formatLocation(booking.slot.locationType)}</span>
                      </div>
                    </div>
                    {serviceName && (
                      <p className="text-sm font-inter text-gray-500 dark:text-gray-400 mt-1">
                        {serviceName}
                      </p>
                    )}
                  </div>
                  {booking.totalAmount && (
                    <div className="text-right">
                      <span className="text-sm font-poppins font-semibold text-gray-900 dark:text-white">
                        €{booking.totalAmount}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-2" />
            <p className="text-sm font-inter text-gray-500 dark:text-gray-400">
              No appointments today
            </p>
            <p className="text-xs font-inter text-gray-400 dark:text-gray-500 mt-1">
              Your schedule is clear for today
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/dashboard/availability')}
            >
              Add Availability
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// Quick Stats Component
// ============================================================================

const QuickStats = ({ dashboardData, isLoading }: { dashboardData: any; isLoading: boolean }) => {
  const router = useRouter();

  const formatRevenue = (cents: number) =>
    `€${(cents / 100).toLocaleString('en-IE', { minimumFractionDigits: 0 })}`;

  const stats = [
    {
      label: "Today's Bookings",
      value: dashboardData?.todayBookings?.toString() || '0',
      onClick: () => router.push('/dashboard/appointments'),
    },
    {
      label: 'Weekly Revenue',
      value: formatRevenue(dashboardData?.weeklyRevenue?.value || 0),
      change: dashboardData?.weeklyRevenue?.trendPercentage,
      isUp: dashboardData?.weeklyRevenue?.trendDirection === 'up',
      onClick: () => router.push('/dashboard/analytics'),
    },
    {
      label: 'Total Appointments',
      value: dashboardData?.totalAppointments?.value?.toString() || '0',
      change: dashboardData?.totalAppointments?.trendPercentage,
      isUp: dashboardData?.totalAppointments?.trendDirection === 'up',
      onClick: () => router.push('/dashboard/appointments'),
    },
    {
      label: 'Unread Messages',
      value: dashboardData?.unreadMessages?.toString() || '0',
      onClick: () => router.push('/dashboard/messages'),
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
            Quick Stats
          </CardTitle>
          <CardDescription className="font-inter">Your performance at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="h-3 bg-gray-200 dark:bg-gray-700/60 rounded w-20 mb-2 animate-pulse" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-poppins font-bold text-charcoal">Quick Stats</CardTitle>
        <CardDescription className="font-inter">Your performance at a glance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
              onClick={stat.onClick}
            >
              <p className="text-xs font-inter text-gray-500 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className="text-xl font-poppins font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              {stat.change !== undefined && (
                <p
                  className={cn(
                    'text-xs font-inter mt-1',
                    stat.isUp ? 'text-green-600' : 'text-red-600',
                  )}
                >
                  {stat.isUp ? '+' : ''}
                  {stat.change?.toFixed(1)}% from last period
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const FreelancerHome = () => {
  const { role } = useAuth();
  const { data: dashboardData, isLoading: loading, error } = useFreelancerDashboard();

  useEffect(() => {
    if (error && !dashboardData) {
      toast.error((error as any)?.message || 'Failed to load dashboard data');
    }
  }, [error, dashboardData]);

  const isLoading = loading && !dashboardData;

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
        {/* Trial Banner */}
        <TrialBanner />

        {/* Quick Stats */}
        <QuickStats dashboardData={dashboardData} isLoading={isLoading} />

        {/* Today's Appointments - Prominent at top */}
        <TodayAppointments />

        {/* Profile Completion Widget - Only shows if incomplete */}
        <ProfileCompletionWidget />

        {/* Weekly Chart */}
        <Charts dashboardData={dashboardData ?? null} isLoading={isLoading} />
      </div>
    </DashboardPageWrapper>
  );
};

export default FreelancerHome;
