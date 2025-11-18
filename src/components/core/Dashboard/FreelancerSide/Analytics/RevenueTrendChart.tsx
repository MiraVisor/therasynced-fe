'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueTrendChartProps {
  data?: Array<{ date: string; revenue: number }>;
  isLoading?: boolean;
}

const RevenueTrendChart = ({ data, isLoading = false }: RevenueTrendChartProps) => {
  const chartData = data && data.length > 0 ? data : [];

  if (isLoading || !chartData || chartData.length === 0) {
    if (isLoading) {
      return (
        <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
            <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-1/3 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700/20 rounded w-1/2 animate-pulse"></div>
          </CardHeader>
          <CardContent className="flex items-center justify-center w-full min-h-[300px] p-6">
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800/20 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      );
    }

    // No data available
    return (
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
            Revenue Trend
          </CardTitle>
          <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
            Daily revenue for the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center w-full min-h-[300px] p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">No revenue data available</p>
            <p className="text-xs text-muted-foreground">Revenue trends will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
        <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
          Revenue Trend
        </CardTitle>
        <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
          Daily revenue for the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center w-full min-h-[300px] p-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#26A69A" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#26A69A" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tick={{ fill: '#2C3E50', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tick={{ fill: '#2C3E50', fontSize: 11 }}
              width={50}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '8px',
              }}
              formatter={(value: number) => [`€${value}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#26A69A"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueTrendChart;
