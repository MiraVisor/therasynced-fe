'use client';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';

const ExplorePage = () => {
  return (
    <DashboardPageWrapper
      header={
        <h2 className="text-xl font-semibold">Hi Nadeem! 👋 Here’s what’s happening today.</h2>
      }
    >
      {/* Page-specific content */}
      <div>Explore things here</div>
    </DashboardPageWrapper>
  );
};

export default ExplorePage;
