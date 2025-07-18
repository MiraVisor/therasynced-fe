'use client';

import dynamicImport from 'next/dynamic';
import { useEffect, useState } from 'react';

import { ROLES, RoleType } from '@/types/types';

export const dynamic = 'force-dynamic';

// Dynamically import components that use Redux to prevent SSR issues
const AdminHome = dynamicImport(() => import('@/components/core/Dashboard/AdminSide/AdminHome'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

const FreelancerHome = dynamicImport(
  () => import('@/components/core/Dashboard/FreelancerSide/Home'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  },
);

const UserOverview = dynamicImport(
  () => import('@/components/core/Dashboard/UserSide/Overview/UserOverviewMain'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  },
);

function DashboardContent() {
  const [userRole, setUserRole] = useState<RoleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dynamically import and use the auth hook only on client side
    import('@/redux/hooks/useAppHooks').then(({}) => {
      // For now, we'll use a simple approach to get the role
      // In a real implementation, you might want to use a more sophisticated approach
      const storedRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
      setUserRole((storedRole as RoleType) || ROLES.PATIENT);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !userRole) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {userRole === ROLES.PATIENT && <UserOverview />}
      {userRole === ROLES.FREELANCER && <FreelancerHome />}
      {userRole === ROLES.ADMIN && <AdminHome />}
    </>
  );
}

export default function DashboardHome() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return <DashboardContent />;
}
