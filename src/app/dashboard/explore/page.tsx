'use client';

import { ExpertList } from '@/components/core/Dashboard/UserSide/Explore/ExpertList';
import { SectionHeader } from '@/components/core/Dashboard/UserSide/Explore/SectionHeader';
import { ViewMoreButton } from '@/components/core/Dashboard/UserSide/Explore/ViewMoreButton';

const ExplorePage = () => {
  return (
    <div className="p-6">
      <SectionHeader />
      <ExpertList />
      <ViewMoreButton />
    </div>
  );
};

export default ExplorePage;
