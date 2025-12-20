'use client';

import { Shield } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { AdminPageSkeleton } from '@/components/common/PageSkeleton';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { useAuthStore } from '@/stores/authStore';
import { ROLES } from '@/types/types';

// Dynamically import heavy audit dashboard component
const AuditDashboard = dynamic(
  () =>
    import('@/components/core/Dashboard/Audit/AuditDashboard').then((mod) => ({
      default: mod.AuditDashboard,
    })),
  {
    loading: () => <AdminPageSkeleton />,
    ssr: false,
  },
);

export default function AdminAuditPage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/authentication/sign-in');
      return;
    }
    if (role && role !== ROLES.ADMIN) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }
    if (role === ROLES.ADMIN) {
      setIsAuthorized(true);
    }
  }, [isAuthenticated, role, router]);

  if (!isAuthorized || role !== ROLES.ADMIN) {
    return null;
  }

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Audit & Compliance</h1>
          </div>
        </div>
      }
    >
      <AuditDashboard />
    </DashboardPageWrapper>
  );
}
