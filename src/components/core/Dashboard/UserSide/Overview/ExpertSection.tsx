import React from 'react';

import { Expert } from '@/types/types';

import ExpertCard from './ExpertCard';

interface ExpertListProps {
  experts: Expert[];
}

export const ExpertList: React.FC<ExpertListProps> = ({ experts }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
    {experts.map((expert, idx) => (
      <ExpertCard key={expert.id || idx} {...expert} />
    ))}
  </div>
);
