'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceAnalytics {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
  averagePrice: number;
  percentage: number;
}

interface ServiceAnalyticsChartProps {
  data: ServiceAnalytics[];
  isLoading?: boolean;
}

const ServiceAnalyticsChart = ({ data, isLoading = false }: ServiceAnalyticsChartProps) => {
  // Sort by bookings and take top 5
  const topServices = [...data].sort((a, b) => b.bookings - a.bookings).slice(0, 5);

  // Transform data for chart
  const chartData = topServices.map((service) => ({
    name: service.name.length > 15 ? `${service.name.substring(0, 15)}...` : service.name,
    fullName: service.name,
    bookings: service.bookings,
    revenue: service.revenue,
  }));

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

  if (!data || data.length === 0) {
    return (
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
            Top Services
          </CardTitle>
          <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
            Services by bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center w-full h-[250px] p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No service data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl min-h-[398px]">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
        <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
          Top Services
        </CardTitle>
        <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
          Services by bookings
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center w-full h-[250px] p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: 5,
              right: 30,
              left: 80,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#2C3E50', fontSize: 11 }}
            />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#2C3E50', fontSize: 11 }}
              width={75}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '8px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'bookings') {
                  return [`${value} bookings`, 'Bookings'];
                }
                return [`EUR ${value}`, 'Revenue'];
              }}
              labelFormatter={(label) => chartData.find((d) => d.name === label)?.fullName || label}
            />
            <Bar
              dataKey="bookings"
              fill="#26A69A"
              radius={[0, 6, 6, 0]}
              maxBarSize={40}
              className="hover:fill-teal transition-all duration-200"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ServiceAnalyticsChart;
