import React from 'react';

interface RevenueChartProps {
  month: string;
  months: string[];
  onMonthChange: (month: string) => void;
  xLabels: string[];
  profitData: number[];
  lossData: number[];
  className?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  month,
  months,
  onMonthChange,
  xLabels,
  profitData,
  lossData,
  className = '',
}) => {
  // Find the max value for scaling
  const maxY = Math.max(...profitData, ...lossData, 100);

  // Generate points for SVG polyline/area
  const getPoints = (data: number[]) => {
    const step = 100 / (data.length - 1);
    return data.map((y, i) => `${i * step},${100 - (y / maxY) * 100}`).join(' ');
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Monthly Revenue</h3>
        <select
          className="text-sm border rounded-md px-4 py-2 focus:outline-none focus:ring"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="h-64 w-full relative">
        {/* Chart visualization using SVG */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute left-8 right-0 top-0 bottom-0 w-[calc(100%-2rem)] h-full"
        >
          {/* Loss area */}
          <polygon
            fill="#ffa58b"
            fillOpacity={0.4}
            points={`0,100 ${getPoints(lossData)} 100,100`}
          />
          {/* Profit area */}
          <polygon
            fill="#e3b9ff"
            fillOpacity={0.6}
            points={`0,100 ${getPoints(profitData)} 100,100`}
          />
        </svg>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-400 z-10">
          <span>{maxY}</span>
          <span>{Math.round((maxY * 4) / 5)}</span>
          <span>{Math.round((maxY * 3) / 5)}</span>
          <span>{Math.round((maxY * 2) / 5)}</span>
          <span>{Math.round((maxY * 1) / 5)}</span>
          <span>0</span>
        </div>
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-400 pt-2 z-10">
          {xLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>

      {/* Legend below chart */}
      <div className="flex items-center justify-center mt-8 gap-8">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full mr-2" style={{ background: '#ffa58b' }}></span>
          <span className="text-xs">Loss</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full mr-2" style={{ background: '#e3b9ff' }}></span>
          <span className="text-xs">Profit</span>
        </div>
      </div>
    </div>
  );
};
