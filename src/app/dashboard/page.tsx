'use client';

import { useAuth } from '@/redux/hooks/useAppHooks';

export default function DashboardHome() {
  const { role: userRole } = useAuth();

  return (
    <>
      {userRole === 'user' && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
          {/* Add upcoming sessions list/calendar */}
        </div>
      )}

      {userRole === 'freelancer' && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Today&apos;s Schedule</h2>
          {/* Add today&apos;s appointments list */}
        </div>
      )}

      {userRole === 'admin' && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
          {/* Add platform statistics and charts */}
        </div>
      )}
    </>
  );
}
