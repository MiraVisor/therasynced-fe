'use client';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { SearchBar } from '@/components/core/Dashboard/SearchBar';
import { ExpertList } from '@/components/core/Dashboard/UserSide/Overview/ExpertSection';
import { SectionHeader } from '@/components/core/Dashboard/UserSide/Overview/SectionHeader';
import UserOverview from '@/components/core/Dashboard/UserSide/Overview/UserOverviewMain';
import { ViewMoreButton } from '@/components/core/Dashboard/UserSide/Overview/ViewMoreButton';
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
