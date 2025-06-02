'use client';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';

export default function MyBookingsPage() {
  return (
    <DashboardPageWrapper
      header={
        <h2 className="text-xl font-semibold">Hi Nadeem! 👋 Here’s what’s happening today.</h2>
      }
    >
      {/* Page-specific content */}
      <div>Your bookings go here</div>
    </DashboardPageWrapper>
  );
}
