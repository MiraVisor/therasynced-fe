'use client';

import { useAuth } from '@/redux/hooks/useAppHooks';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import BookingHistoryChart from './BookingHistoryChart';
import FavoriteFreelancersCarousel from './FavoriteFreelancersCarousel';
import NextAppointmentHero from './NextAppointmentHero';
import RecentBookingActivity from './RecentBookingActivity';

const UserHome = () => {
  const { role } = useAuth();

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
        {/* Next Appointment Hero */}
        <NextAppointmentHero booking={null} loading={false} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Booking History Chart */}
          <BookingHistoryChart />

          {/* Favorite Freelancers Carousel */}
          <FavoriteFreelancersCarousel />
        </div>

        {/* Recent Booking Activity */}
        <RecentBookingActivity />
      </div>
    </DashboardPageWrapper>
  );
};

export default UserHome;
