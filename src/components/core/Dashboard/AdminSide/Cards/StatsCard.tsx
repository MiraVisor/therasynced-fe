import React from 'react';
import { FaArrowTrendDown, FaArrowTrendUp } from 'react-icons/fa6';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend: {
    value: number;
    isUp: boolean;
    timeframe: string;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm">{title}</span>
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
