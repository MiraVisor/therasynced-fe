import React, { ReactNode } from 'react';

interface CardContainerProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const CardContainer: React.FC<CardContainerProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-5 ${className}`}>
      <h3 className="text-base font-medium mb-4 border-b border-gray-200 pb-2">{title}</h3>
      {children}
    </div>
  );
};
