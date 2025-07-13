import React from 'react';

interface RevenueChartProps {
  month: string;
  className?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ month, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Monthly Revenue</h3>
        <select className="text-sm border rounded-md px-2 py-1">
          <option value={month}>{month}</option>
          <option value="September">September</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>
      </div>

      <div className="h-64 w-full relative">
        {/* Simplified chart visualization */}
        <div className="absolute bottom-0 left-0 right-0 h-full">
          <div className="relative h-full flex items-end">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-400">
              <span>100</span>
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>

            {/* Chart content */}
            <div className="ml-8 h-full flex-grow flex items-end">
              <div className="relative w-full h-full">
                {/* Chart lines (simplified) */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-full h-px bg-gray-100"></div>
                  ))}
                </div>

                {/* Chart data visualization */}
                <div className="absolute bottom-0 left-0 right-0 h-full flex justify-between items-end">
                  {/* This is a simplified representation; in a real app, you'd map over real data */}
                  <div className="relative w-full h-full flex justify-around">
                    <div
                      style={{ height: '45%', width: '100%', position: 'absolute', bottom: 0 }}
                      className="bg-pink-200 opacity-60 rounded-t-lg"
                    ></div>
                    <div
                      style={{ height: '65%', width: '100%', position: 'absolute', bottom: 0 }}
                      className="bg-purple-300 opacity-60 rounded-t-lg"
                    ></div>
                  </div>
                </div>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 pt-2">
                  {[
                    '5k',
                    '10k',
                    '15k',
                    '20k',
                    '25k',
                    '30k',
                    '35k',
                    '40k',
                    '45k',
                    '50k',
                    '55k',
                    '60k',
                  ].map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center mt-4 gap-8">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-pink-300 mr-2"></span>
          <span className="text-xs">Loss</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-purple-400 mr-2"></span>
          <span className="text-xs">Profit</span>
        </div>
      </div>
    </div>
  );
};
