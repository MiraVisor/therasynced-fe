'use client';

import dynamicImport from 'next/dynamic';
import { useEffect, useState } from 'react';

import { getDecodedToken } from '@/lib/utils';
import { ROLES, RoleType } from '@/types/types';

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

const UserExplore = dynamicImport(
  () => import('@/components/core/Dashboard/UserSide/Explore/UserExploreMain'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  },
);

function DashboardContent() {
  const [userRole, setUserRole] = useState<RoleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get role from token
    const decodedToken = getDecodedToken();
    setUserRole(decodedToken?.role as RoleType);
    setIsLoading(false);
  }, []);

  console.log('userRole', userRole);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading user role...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {userRole === ROLES.PATIENT && <UserExplore />}
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <DashboardContent />;
}
