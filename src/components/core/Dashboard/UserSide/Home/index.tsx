'use client';

import { useAuth } from '@/hooks/useAuthZustand';

import { DashboardPageWrapper } from '../../DashboardPageWrapper';
import FavoriteFreelancersCarousel from './FavoriteFreelancersCarousel';
import NextAppointmentHero from './NextAppointmentHero';
import YourSessions from './YourSessions';

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

        {/* Favorite Freelancers - Simplified */}
        <FavoriteFreelancersCarousel />

        {/* Your Sessions - Combined upcoming and past */}
        <YourSessions />
      </div>
    </DashboardPageWrapper>
  );
};

export default UserHome;
