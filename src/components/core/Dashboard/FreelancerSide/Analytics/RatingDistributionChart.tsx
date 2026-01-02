'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RatingDistributionData {
  oneStar: number;
  twoStar: number;
  threeStar: number;
  fourStar: number;
  fiveStar: number;
  totalRatings: number;
}

interface RatingDistributionChartProps {
  data?: RatingDistributionData;
  isLoading?: boolean;
}

const RatingDistributionChart = ({ data, isLoading = false }: RatingDistributionChartProps) => {
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

  if (!data || data.totalRatings === 0) {
    return (
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
            Rating Distribution
          </CardTitle>
          <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
            Distribution of client ratings
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
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-charcoal mb-1">No ratings yet</p>
            <p className="text-xs text-muted-foreground">
              Rating distribution will appear here once clients start leaving reviews
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { rating: '1★', count: data.oneStar, percentage: (data.oneStar / data.totalRatings) * 100 },
    { rating: '2★', count: data.twoStar, percentage: (data.twoStar / data.totalRatings) * 100 },
    { rating: '3★', count: data.threeStar, percentage: (data.threeStar / data.totalRatings) * 100 },
    { rating: '4★', count: data.fourStar, percentage: (data.fourStar / data.totalRatings) * 100 },
    { rating: '5★', count: data.fiveStar, percentage: (data.fiveStar / data.totalRatings) * 100 },
  ];

  return (
    <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
        <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
          Rating Distribution
        </CardTitle>
        <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
          Distribution of client ratings ({data.totalRatings} total ratings)
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
                dataKey="rating"
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
                ) => [`${value} (${props.payload.percentage.toFixed(1)}%)`, 'Ratings']}
              />
              <Bar
                dataKey="count"
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

export default RatingDistributionChart;
