import React from 'react';

import { Expert } from '@/types/types';

import ExpertCard from './ExpertCard';

interface ExpertListProps {
  experts: Expert[];
}

export const ExpertList: React.FC<ExpertListProps> = ({ experts }) => {
  if (!experts || experts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 experts available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 auto-rows-fr">
      {experts.map((expert, idx) => (
        <div key={expert.id || `expert-${idx}`} className="w-full">
          <ExpertCard {...expert} />
        </div>
      ))}
    </div>
  );
};
