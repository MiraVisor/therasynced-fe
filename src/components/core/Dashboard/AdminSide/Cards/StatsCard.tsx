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
  bgColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, icon, bgColor }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm">{title}</span>
        {icon && (
          <div
            className="w-10 h-10 flex items-center justify-center rounded-md "
            style={{ backgroundColor: bgColor ?? '#f3f4f6' }}
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
          {trend.isUp ? (
            <FaArrowTrendUp size={14} className="text-green-500" />
          ) : (
            <FaArrowTrendDown size={14} className="text-red-500" />
          )}
        </span>
        <span>
          {Math.abs(trend.value)}% {trend.isUp ? 'Up' : 'Down'} from {trend.timeframe}
        </span>
      </div>
    </div>
  );
};
