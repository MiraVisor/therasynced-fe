import React from 'react';

interface ApplicationCardProps {
  name: string;
  specialty: string;
  onReview: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ name, specialty, onReview }) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-none">
      <div>
        <h4 className="font-medium text-sm">{name}</h4>
        <p className="text-xs text-gray-500">{specialty}</p>
      </div>
      <button
        onClick={onReview}
        className="px-4 py-1.5 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
      >
        Review
      </button>
    </div>
  );
};
