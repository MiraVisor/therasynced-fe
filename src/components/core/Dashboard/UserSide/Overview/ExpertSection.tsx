import React from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export interface Expert {
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  description: string;
  isFavorite?: boolean;
}

interface ExpertCardProps extends Expert {}

const ExpertCard: React.FC<ExpertCardProps> = ({
  name,
  specialty,
  experience,
  rating,
  description,
  isFavorite = false,
}) => (
  <div className="border rounded-lg p-4 flex flex-col gap-2 relative min-w-[280px]">
    <div className="flex items-center gap-3">
      <Avatar />
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-xs text-gray-500">{specialty}</div>
        <div className="text-xs text-gray-500">{experience}</div>
        <div className="flex items-center gap-1 mt-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
              ★
            </span>
          ))}
        </div>
      </div>
      <button className="absolute top-3 right-3 text-red-500 bg-white rounded-full p-1 border border-gray-200">
        {isFavorite ? '♥' : '♡'}
      </button>
    </div>
    <div className="text-sm text-gray-600 mt-2">{description}</div>
    <div className="flex gap-2 mt-4">
      <Button variant="outline">View Profile</Button>
      <Button>Book Now</Button>
    </div>
  </div>
);

interface ExpertListProps {
  experts: Expert[];
}

export const ExpertList: React.FC<ExpertListProps> = ({ experts }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {experts.map((expert, idx) => (
      <ExpertCard key={idx} {...expert} />
    ))}
  </div>
);
