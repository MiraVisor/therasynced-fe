import React, { ReactNode } from 'react';
import { FaArrowTrendUp } from 'react-icons/fa6';
import { FaArrowTrendDown } from 'react-icons/fa6';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend: {
    value: number;
    isUp: boolean;
    timeframe: string;
  };
  icon?: ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, icon }) => {
  // Function to get the appropriate background color based on title
  const getIconBackground = (title: string) => {
    switch (title) {
      case 'Total Users':
        return 'bg-purple-100';
      case 'Active Clients':
        return 'bg-yellow-100';
      case 'Sessions This Month':
        return 'bg-red-100';
      case 'Revenue':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm">{title}</span>
        {icon && (
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-full ${getIconBackground(title)}`}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="font-semibold text-2xl mb-2">{value}</div>
      <div
        className={`flex items-center text-xs ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}
      >
        <span className="mr-1">
          {trend.isUp ? <FaArrowTrendUp size={14} /> : <FaArrowTrendDown size={14} />}
        </span>
        <span>
          {Math.abs(trend.value)}% {trend.isUp ? 'Up' : 'Down'} from {trend.timeframe}
        </span>
      </div>
    </div>
  );
};
