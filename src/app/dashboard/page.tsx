'use client';

import AdminHome from '@/components/core/Dashboard/AdminSide/AdminHome';
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

      {userRole === ROLES.ADMIN && <AdminHome />}
    </>
  );
}
