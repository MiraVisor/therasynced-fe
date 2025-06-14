import React from 'react';

import ExpertCard, { Expert } from './ExpertCard';

interface ExpertListProps {
  experts: Expert[];
}

export const ExpertList: React.FC<ExpertListProps> = ({ experts }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {experts.map((expert, idx) => (
      <ExpertCard key={idx} {...expert} />
    ))}
  </div>
);
