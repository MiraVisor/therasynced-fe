'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceCategoryAnalytics {
  categoryName: string;
  bookings: number;
  revenue: number;
  percentage: number;
}

interface CategoryBreakdownChartProps {
  data: ServiceCategoryAnalytics[];
  isLoading?: boolean;
}

const CategoryBreakdownChart = ({ data, isLoading = false }: CategoryBreakdownChartProps) => {
  // Transform data for chart
  const chartData = data.map((category) => ({
    name:
      category.categoryName.length > 15
        ? `${category.categoryName.substring(0, 15)}...`
        : category.categoryName,
    fullName: category.categoryName,
    bookings: category.bookings,
    revenue: category.revenue,
    percentage: category.percentage,
  }));

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

  if (!data || data.length === 0) {
    return (
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
            Category Breakdown
          </CardTitle>
          <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
            Bookings by category
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center w-full min-h-[300px] p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No category data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl min-h-[398px]">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
        <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
          Category Breakdown
        </CardTitle>
        <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
          Bookings by category
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center w-full h-[250px] p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#2C3E50', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#2C3E50', fontSize: 11 }}
              width={50}
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
                if (name === 'percentage') {
                  return [`${value.toFixed(1)}%`, 'Percentage'];
                }
                return [`€${value}`, 'Revenue'];
              }}
              labelFormatter={(label) => chartData.find((d) => d.name === label)?.fullName || label}
            />
            <Bar
              dataKey="bookings"
              fill="#007745"
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
              className="hover:fill-primary transition-all duration-200"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdownChart;
