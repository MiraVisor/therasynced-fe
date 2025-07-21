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

const UserHome = dynamicImport(
  () => import('@/components/core/Dashboard/UserSide/Explore/UserExploreMain'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  },
);

function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<RoleType | null>(null);

  useEffect(() => {
    // Get role from cookie token using the getDecodedToken utility
    import('@/lib/utils').then(({ getDecodedToken }) => {
      const decodedToken = getDecodedToken();
      setUserRole(decodedToken?.role as RoleType);
      setIsLoading(false);
    });
  }, []);

  console.log('userRole', userRole);

  if (isLoading || !userRole) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {userRole === ROLES.PATIENT && <UserHome />}
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
