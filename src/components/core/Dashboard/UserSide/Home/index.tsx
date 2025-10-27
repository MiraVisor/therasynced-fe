'use client';

import { useEffect, useState } from 'react';

import LoadingSpinner from '@/components/ui/loading-spinner';
import { getPatientBookingHistory } from '@/redux/api/bookingApi';
import { useAuth } from '@/redux/hooks/useAppHooks';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import BookingHistoryChart from './BookingHistoryChart';
import FavoriteFreelancersCarousel from './FavoriteFreelancersCarousel';
import NextAppointmentHero from './NextAppointmentHero';
import RecentBookingActivity from './RecentBookingActivity';

const UserHome = () => {
  const { role } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [nextAppointment, setNextAppointment] = useState<any>(null);

  // Fetch next appointment
  useEffect(() => {
    const fetchNextAppointment = async () => {
      try {
        const response = await getPatientBookingHistory({
          page: 1,
          limit: 10,
          sortBy: 'slot.startTime',
          sortOrder: 'asc',
        });

        if (response.success && Array.isArray(response.data)) {
          // Find the next upcoming appointment
          const now = new Date();
          const upcomingAppointments = response.data.filter((booking: any) => {
            if (!booking?.slot?.startTime) return false;
            const bookingDate = new Date(booking.slot.startTime);
            return bookingDate > now;
          });

          if (upcomingAppointments.length > 0) {
            setNextAppointment(upcomingAppointments[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch next appointment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNextAppointment();
  }, []);

  if (isLoading) {
    return (
      <DashboardPageWrapper
        userRole={role}
        header={
          <h2 className="text-2xl font-poppins font-bold text-charcoal">Dashboard Overview</h2>
        }
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper
      userRole={role}
      header={<h2 className="text-2xl font-poppins font-bold text-charcoal">Dashboard Overview</h2>}
    >
      <div className="flex flex-col gap-6 lg:gap-8">
        {/* Next Appointment Hero */}
        <NextAppointmentHero booking={nextAppointment} loading={false} />

        {/* Booking History Chart */}
        <BookingHistoryChart />

        {/* Favorite Freelancers Carousel */}
        <FavoriteFreelancersCarousel />

        {/* Recent Booking Activity */}
        <RecentBookingActivity />
      </div>
    </DashboardPageWrapper>
  );
};

export default UserHome;
