'use client';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { ExpertList } from '@/components/core/Dashboard/UserSide/Explore/ExpertList';
import { SearchBar } from '@/components/core/Dashboard/UserSide/Explore/SearchBar';
import { SectionHeader } from '@/components/core/Dashboard/UserSide/Explore/SectionHeader';
import { ViewMoreButton } from '@/components/core/Dashboard/UserSide/Explore/ViewMoreButton';
import UserOverview from '@/components/core/Dashboard/UserSide/Overview/UserOverview';
import { useAuth } from '@/redux/hooks/useAppHooks';
import { ROLES } from '@/types/types';

export default function DashboardHome() {
  const { role: userRole } = useAuth();

  return (
    <>
      {userRole === ROLES.PATIENT && <UserOverview />}

      {userRole === ROLES.FREELANCER && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Today&apos;s Schedule</h2>
          {/* Add freelancer-specific components here */}
        </div>
      )}

      {userRole === ROLES.ADMIN && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
          {/* Add admin-specific components here */}
        </div>
      )}
    </>
  );
}
