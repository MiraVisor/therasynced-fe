import React from 'react';

interface NotFoundProps {
  message?: string;
  iconSize?: number;
}

const NotFound: React.FC<NotFoundProps> = ({ message = 'No data found.', iconSize = 64 }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-12">
      <svg width={iconSize} height={iconSize} fill="none" viewBox="0 0 64 64">
        <rect width="64" height="64" rx="16" fill="#F3F4F6" />
        <g>
          <circle cx="32" cy="32" r="20" fill="#F9FAFB" stroke="#A1A1AA" strokeWidth="2" />
          <path d="M24 36c1.5-2 4.5-2 6 0" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" />
          <circle cx="27" cy="28" r="2" fill="#A1A1AA" />
          <circle cx="37" cy="28" r="2" fill="#A1A1AA" />
        </g>
        <circle cx="32" cy="32" r="30" stroke="#E5E7EB" strokeWidth="4" />
      </svg>
      <p className="mt-6 text-lg font-semibold text-gray-500 text-center">{message}</p>
    </div>
  );
};

export default NotFound;
