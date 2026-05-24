'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PeakTimesData {
  hourlyData?: Array<{ hour: number; bookings: number }>;
  dailyData?: Array<{ day: string; bookings: number }>;
}

interface PeakTimesChartProps {
  data?: PeakTimesData;
  isLoading?: boolean;
}

const PeakTimesChart = ({ data, isLoading = false }: PeakTimesChartProps) => {
  if (isLoading) {
    return (
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        </CardHeader>
        <CardContent className="flex items-center justify-center w-full min-h-[300px] p-6">
          <div className="w-full h-full bg-gray-100 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data || (!data.hourlyData && !data.dailyData)) {
    return (
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
            Peak Booking Times
          </CardTitle>
          <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
            Booking frequency by time of day and day of week
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center w-full min-h-[300px] p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-charcoal mb-1">No booking time data yet</p>
            <p className="text-xs text-muted-foreground">
              Peak booking times will appear here once you have booking data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use hourly data if available, otherwise use daily data
  const chartData = data.hourlyData
    ? data.hourlyData.map((item) => ({
        name: `${item.hour}:00`,
        bookings: item.bookings,
      }))
    : data.dailyData
      ? data.dailyData.map((item) => ({
          name: item.day,
          bookings: item.bookings,
        }))
      : [];

  return (
    <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
        <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
          Peak Booking Times
        </CardTitle>
        <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
          {data.hourlyData
            ? 'Booking frequency by hour of day'
            : 'Booking frequency by day of week'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fill: '#2C3E50', fontSize: 11 }}
                angle={data.hourlyData ? -45 : 0}
                textAnchor={data.hourlyData ? 'end' : 'middle'}
                height={data.hourlyData ? 60 : 30}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fill: '#2C3E50', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '8px',
                }}
                formatter={(value: number) => [`${value} bookings`, 'Bookings']}
              />
              <Bar
                dataKey="bookings"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
                fill="#26A69A"
                className="hover:fill-teal transition-all duration-200"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeakTimesChart;
