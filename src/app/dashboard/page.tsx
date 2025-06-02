'use client';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { ExpertList } from '@/components/core/Dashboard/UserSide/Explore/ExpertList';
import { SearchBar } from '@/components/core/Dashboard/UserSide/Explore/SearchBar';
import { SectionHeader } from '@/components/core/Dashboard/UserSide/Explore/SectionHeader';
import { ViewMoreButton } from '@/components/core/Dashboard/UserSide/Explore/ViewMoreButton';
import { useAuth } from '@/redux/hooks/useAppHooks';

export default function DashboardHome() {
  const { role: userRole } = useAuth();

  return (
    <DashboardPageWrapper header={<SearchBar isLocationEnabled />}>
      {userRole === 'user' && (
        <div className="mb-12">
          <SectionHeader />
          <ExpertList />
          <ViewMoreButton />
        </div>
      )}
      {userRole === 'freelancer' && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Today&apos;s Schedule</h2>
        </div>
      )}
      {userRole === 'admin' && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
        </div>
      )}
    </DashboardPageWrapper>
  );
}
