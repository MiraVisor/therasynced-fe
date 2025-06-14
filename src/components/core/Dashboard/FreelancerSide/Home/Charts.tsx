'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const chartData = [
  { day: 'Mon', current: 4, last: 3 },
  { day: 'Tue', current: 6, last: 4 },
  { day: 'Wed', current: 5, last: 5 },
  { day: 'Thu', current: 7, last: 6 },
  { day: 'Fri', current: 8, last: 7 },
  { day: 'Sat', current: 3, last: 2 },
  { day: 'Sun', current: 2, last: 1 },
];

const ChartTooltipContent = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
        <div className="space-y-1">
          <p className="text-sm text-[#E69DB8]">
            Current Week: <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm text-[#E9A5F1]">
            Last Week: <span className="font-medium">{payload[1].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const Charts = () => {
  return (
    <Card className="w-full border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl lg:rounded-2xl">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white px-4 lg:px-5 py-4 lg:py-5">
        <CardTitle className="text-base lg:text-lg font-semibold text-gray-800">
          Weekly Appointments
        </CardTitle>
        <CardDescription className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1">
          Current vs Last Week
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center w-full h-[300px] lg:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tick={{ fill: '#4b5563', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tick={{ fill: '#4b5563', fontSize: 12 }}
            />
            <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }} />

            <Bar
              dataKey="current"
              name="current"
              fill="#E69DB8"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              className="hover:fill-[#E69DB8]/80 transition-colors duration-200"
            />
            <Bar
              dataKey="last"
              name="last"
              fill="#E9A5F1"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              className="hover:fill-[#E9A5F1]/80 transition-colors duration-200"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default Charts;
