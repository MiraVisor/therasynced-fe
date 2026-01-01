'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BookingPerformanceData {
  cancellationRate: number;
  noShowRate: number;
  reschedulingCount: number;
  conversionRate: number;
  totalBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  rescheduledBookings: number;
  totalSlots: number;
  bookedSlots: number;
}

interface BookingPerformanceChartProps {
  data?: BookingPerformanceData;
  isLoading?: boolean;
}

const BookingPerformanceChart = ({ data, isLoading = false }: BookingPerformanceChartProps) => {
  if (isLoading) {
    return (
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700/20 rounded w-1/2 animate-pulse" />
        </CardHeader>
        <CardContent className="flex items-center justify-center w-full min-h-[300px] p-6">
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800/20 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.totalBookings === 0) {
    return (
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
            Booking Performance
          </CardTitle>
          <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
            Cancellation, no-show, and conversion metrics
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-charcoal mb-1">No booking data yet</p>
            <p className="text-xs text-muted-foreground">
              Booking performance metrics will appear here once you have completed bookings
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    {
      name: 'Cancellation',
      value: data.cancellationRate,
      count: data.cancelledBookings,
      color: '#ef4444',
    },
    {
      name: 'No-Show',
      value: data.noShowRate,
      count: data.noShowBookings,
      color: '#f59e0b',
    },
    {
      name: 'Rescheduled',
      value: (data.rescheduledBookings / data.totalBookings) * 100,
      count: data.rescheduledBookings,
      color: '#3b82f6',
    },
    {
      name: 'Conversion',
      value: data.conversionRate,
      count: data.bookedSlots,
      color: '#10b981',
    },
  ];

  return (
    <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
        <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
          Booking Performance
        </CardTitle>
        <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
          Cancellation, no-show, and conversion metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-inter text-muted-foreground">Cancellation Rate</p>
            <p className="text-xl font-poppins font-bold text-red-600">
              {data.cancellationRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">{data.cancelledBookings} cancelled</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-inter text-muted-foreground">No-Show Rate</p>
            <p className="text-xl font-poppins font-bold text-amber-600">
              {data.noShowRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">{data.noShowBookings} no-shows</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-inter text-muted-foreground">Rescheduled</p>
            <p className="text-xl font-poppins font-bold text-blue-600">
              {data.rescheduledBookings}
            </p>
            <p className="text-xs text-muted-foreground">bookings</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-inter text-muted-foreground">Conversion Rate</p>
            <p className="text-xl font-poppins font-bold text-emerald-600">
              {data.conversionRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {data.bookedSlots}/{data.totalSlots} slots
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[250px]">
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
                tick={{ fill: '#2C3E50', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fill: '#2C3E50', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '8px',
                }}
                formatter={(
                  value: number,
                  name: string,
                  props: { payload: (typeof chartData)[0] },
                ) => [`${value.toFixed(1)}%`, props.payload.name]}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
                className="hover:opacity-80 transition-all duration-200"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingPerformanceChart;
