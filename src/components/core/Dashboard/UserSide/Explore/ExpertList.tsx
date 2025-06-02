import React from 'react';

import { ExpertCard } from './ExpertCard';

const experts = [
  {
    name: 'Dr Lee Marshall',
    specialty: 'message therapy',
    experience: '7+ Years of Experience',
    rating: 4,
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain, and feel your best.',
    isFavorite: true,
  },
  // ...repeat or map as needed for demo
];

export const ExpertList: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {experts.map((expert, idx) => (
      <ExpertCard key={idx} {...expert} />
    ))}
  </div>
);
