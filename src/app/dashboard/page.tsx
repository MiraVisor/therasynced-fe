'use client';

import FreelancerHome from '@/components/core/Dashboard/FreelancerSide/Home';
import UserOverview from '@/components/core/Dashboard/UserSide/Overview/UserOverviewMain';
import { useAuth } from '@/redux/hooks/useAppHooks';
import { ROLES } from '@/types/types';

export default function DashboardHome() {
  const { role: userRole } = useAuth();

  return (
    <>
      {userRole === ROLES.PATIENT && <UserOverview />}

      {userRole === ROLES.FREELANCER && <FreelancerHome />}

      {userRole === ROLES.ADMIN && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
          {/* Add admin-specific components here */}
        </div>
      )}
    </>
  );
}
