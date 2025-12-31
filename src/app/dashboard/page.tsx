'use client';

import dynamicImport from 'next/dynamic';
import { useEffect, useState } from 'react';

import {
  AdminPageSkeleton,
  FreelancerPageSkeleton,
  UserPageSkeleton,
} from '@/components/common/PageSkeleton';
import { useAuth } from '@/hooks/useAuthZustand';
import { ROLES } from '@/types/types';

// Dynamically import components that use Redux to prevent SSR issues
const AdminHome = dynamicImport(() => import('@/components/core/Dashboard/AdminSide/AdminHome'), {
  ssr: false,
  loading: () => <AdminPageSkeleton />,
});

const FreelancerHome = dynamicImport(
  () => import('@/components/core/Dashboard/FreelancerSide/Home'),
  {
    ssr: false,
    loading: () => <FreelancerPageSkeleton />,
  },
);

const UserHome = dynamicImport(() => import('@/components/core/Dashboard/UserSide/Home'), {
  ssr: false,
  loading: () => <UserPageSkeleton />,
});

function DashboardContent() {
  const { role: userRole } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show page skeleton until mounted and role is determined
  if (!isMounted || !userRole) {
    return <AdminPageSkeleton />;
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
  return <DashboardContent />;
}
