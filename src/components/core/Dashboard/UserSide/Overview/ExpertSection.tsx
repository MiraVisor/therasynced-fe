import React from 'react';

import { Expert } from '@/types/types';

import ExpertCard from './ExpertCard';

interface ExpertListProps {
  experts: Expert[];
}

export const ExpertList: React.FC<ExpertListProps> = ({ experts }) => {
  if (experts.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center w-full py-12">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <span className="text-2xl">👨‍⚕️</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No experts found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md text-center">
          We couldn&apos;t find any experts matching your criteria. Try adjusting your search
          filters.
        </p>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {experts.map((expert) => (
        <ExpertCard key={expert.id} {...expert} />
      ))}
    </div>
  );
};
