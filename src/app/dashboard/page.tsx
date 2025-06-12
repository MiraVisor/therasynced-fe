'use client';

import { useAuth } from '@/redux/hooks/useAppHooks';
import { ROLES } from '@/types/types';

import Unauthorized from '../unauthorized';

export default function DashboardHome() {
  const { role: userRole } = useAuth();

  switch (userRole) {
    case ROLES.PATIENT:
      return <div>Patient</div>;
    case ROLES.FREELANCER:
      return <div>Freelancer</div>;
    case ROLES.ADMIN:
      return <div>Admin</div>;
    default:
      return <Unauthorized />;
  }
}
